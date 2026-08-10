---
title: 结合nanovllm的FlashAttention和PagedAttention主要原理概述
date: 2026-05-16 15:19:46
tags:
- 大模型
published: true
hideInList: false
feature: null
isTop: false
---

> edit time: 2026-05-16 18:20:34 做了FlashAttention部分好耶
> edit time: 2026-05-16 19:04:38 做了PagedAttention部分好耶

总结：FlashAttention用于降低Attention计算阶段预存的显存消耗（内部计算范畴），
PagedAttention用于高效管理推理的KV Cache（外部推理范畴）。

**FlashAttention**：
- 问题：标准 Attention 需要存储 N×N 的中间矩阵，显存 O(N²)
- 解决：分块 + 在线 softmax，显存降到 O(N)
- 关键：外循环 Q 块，内循环 K、V 块，在线更新 m、l、O

**PagedAttention**：
- 问题：预分配连续显存导致大量浪费（内部碎片 + 外部碎片）
- 解决：分块 + 页表映射 + 动态分配
- 扩展：Prefix Cache + 引用计数，共享公共前缀

## 题目1：中间矩阵的显存问题

在单头情况下（分头时把 $d\_model$ 换成 $d\_model / num\_heads$ ）有
$$Q,K,V \in \mathbb{R}^{seq\_len \times d\_model}$$
$$S=\text{softmax}(Q \times K^T / \sqrt{d}) \times V \in \mathbb{R}^{seq\_len \times seq\_len}$$
1. S矩阵有 $10^5 \times 10^5 = 10^{10}$ 个元素，即序列长度的平方。
2. 存储S需要 $10^{10} \times 4B=40GB$ 。
3. 只有 $24GB$ 时放不下。
总之，**标准Attention的显存复杂度是序列长度的平方**，序列长度变大时显存会爆炸。FlashAttention的目标就是不存储完整的 $S$ 矩阵。
## 题目2：Softmax的在线计算

softmax是对行做的一个操作，把整行从分数转换成概率分布。
$$\text{softmax}(z_i)=\frac{e^{z_i - m}}{\sum_{j \in 1,2,\dots, n} e^{z_j - m}}$$
其中 $m=\max\{z_1,z_2, \dots, z_n\}$ 。

下述研究的是上式的“分母求和项”，即 $\sum_{j \in 1,2,\dots, n} e^{z_j - m}$ 。
但是问题在于，我们并不想立刻遍历大矩阵的整个行得到分母这个求和项，而是希望先对其中的一部分块做操作，得到一个部分的求和。只有在后面的块来了之后，才能逐渐更新这个部分和，直到整行都覆盖到之后得到全局和。
这怎么做呢？就是下述的在线softmax的思想。

维护在线最大值 $m$，和已看到的所有 $e^{x-m}$ 的和 $l$。
和 $l$ 中的第一项是对之前计算的 $l$ 乘以修正系数（因为在线最大值变了），第二项是加上在线到来的新的 $e^{x-m}$ 项。
$$m_{new} \leftarrow \max\{m_{old}, x_{new}\}$$
$$l_{new} \leftarrow l_{old} \cdot e^{m_{old}-m_{new}} + e^{x_{new}-m_{new}}$$
初始时 $[m,l]=[-\infty,0]$ 。

接下来用一个简单例子来练习上述的更新过程：计算 $x=[2,1,4,3]$ 的在线softmax。
- 第一步：
$$m_{new} \leftarrow \max\{-\infty, 2\}=2$$
$$l_{new} \leftarrow e^{2-2}=1$$
看到第一个元素时的 $[m,l]$ 为 $[2,1]$ 。

- 第二步：
$$m_{new} \leftarrow \max\{2,1\}=2$$
$$l_{new} \leftarrow 1 \times e^{2-2} + e^{1-2}=1+e^{-1} \approx 1.3679$$
看到前两个元素时的 $[m,l]$ 更新为 $[2,1.3679]$ 。

- 第三步：
$$m_{new} \leftarrow \max\{2,4\}=4$$
$$l_{new} \leftarrow 1.3679 \times e^{2-4} + e^{4-4} \approx 1.1851$$
看到前三个元素时的 $[m,l]$ 更新为 $[4,1.1851]$ 。

- 第四步：
$$m_{new} \leftarrow \max\{4,3\}=4$$
$$l_{new} \leftarrow . \times e^{4-4} + e^{3-4} \approx 1.5529$$
看到全部四个元素时的 $[m,l]$ 更新为 $[4,1.5529]$ 。

忽略掉一些数值上的舍入误差（当然，也可以通过解析解完全相同来验证），会发现 $l$ 的结果恰好等于我们对 $x=[2,1,3,4]$ 希望求的分母求和项 $l=e^{2-4}+e^{1-4}+e^{3-4}+e^{4-4}$ 。

## 题目3：FlashAttention的核心思想

现在我们有了标准Attention需要乘 $N \times N$ 的 $S$ 矩阵（显存爆炸），
Softmax可以在不存全部值的情况下在线计算这两个知识。
那么，FlashAttention的解决方案就是，把 $Q,K,V$ 都分块，每次只加载一小块到高速SRAM中计算，然后在线更新结果。

简化掉一些算法细节，大致的算法如下。
（为了新手理解方便，把 $Q$ 放在了外层、$K$ 放在了内层，
实际上因为 $K/V$ 被多个 $Q$ 块共用，应该把 $K$ 放在外层、$Q$ 放在内层）
注意它不存储完整的 $S$ ，只存当前小块（$B_r \times B_c$ ，其中 $r$ 和 $c$ 是row和column的意思）。
![](posts/migrated/post-images/20260516175339.png)

问题：对下述设置中的 $Q_1$ 尝试进行一次完整的迭代更新过程。
- 序列长度 $N = 4$
- 分块大小 $B_r = 2$，$B_c = 2$
- 特征维度 $d = 2$，缩放因子 $\sqrt{d} = \sqrt{2}$
$$
Q = \begin{bmatrix}
1 & 0 \\
0 & 1 \\
1 & 1 \\
0 & 0
\end{bmatrix}, \quad
K = \begin{bmatrix}
1 & 1 \\
0 & 1 \\
1 & 0 \\
0 & 0
\end{bmatrix}, \quad
V = \begin{bmatrix}
1 & 0 \\
0 & 1 \\
1 & 1 \\
0 & 0
\end{bmatrix}
$$
分块（按行划分）：
- $Q_1 = Q[0:2] = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}$, $\quad Q_2 = Q[2:4] = \begin{bmatrix}1 & 1 \\ 0 & 0\end{bmatrix}$
- $K_1 = K[0:2] = \begin{bmatrix}1 & 1 \\ 0 & 1\end{bmatrix}$, $\quad K_2 = K[2:4] = \begin{bmatrix}1 & 0 \\ 0 & 0\end{bmatrix}$
- $V_1 = V[0:2] = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}$, $\quad V_2 = V[2:4] = \begin{bmatrix}1 & 1 \\ 0 & 0\end{bmatrix}$
算法状态（对每个 Q 块单独维护）：
- $O$：输出累加器（形状 $B_r \times d_v$），初始为零矩阵
- $m$：当前看到的行最大值（形状 $B_r$ 的向量），初始为 $-\infty$
- $l$：当前看到的分母和（形状 $B_r$ 的向量），初始为 $0$
外循环：遍历每个 $Q_i$ 块  

解决：我们需要处理 $Q_1$ （一次外层循环迭代），
那么分别要计算 $K_1$ 和 $K_2$ 的两次内层循环迭代。
****
首先计算 $S_{11}=Q_1K_1^T / \sqrt{d}$ 。
$$
Q_1 K_1^\top = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}
\begin{bmatrix}1 & 0 \\ 1 & 1\end{bmatrix} = \begin{bmatrix}1 \cdot 1 + 0 \cdot 1 & 1 \cdot 0 + 0 \cdot 1 \\ 0 \cdot 1 + 1 \cdot 1 & 0 \cdot 0 + 1 \cdot 1\end{bmatrix}
= \begin{bmatrix}1 & 0 \\ 1 & 1\end{bmatrix}
$$
$$
S_{11} = \frac{1}{1.414} \begin{bmatrix}1 & 0 \\ 1 & 1\end{bmatrix}
\approx \begin{bmatrix}0.707 & 0 \\ 0.707 & 0.707\end{bmatrix}
$$

接下来在线更新 $m$ 和 $l$。
$$
m = [-\infty, -\infty], \quad l = [0, 0]
$$
$$
\text{row\_max}(S_{11}) = [0.707, 0.707]
$$
$$
m_{\text{new}} = \max(m,\; \text{row\_max}) = [0.707, 0.707]
$$
$$e^{m - m_{\text{new}}} = [0, 0]$$
$$
\begin{bmatrix}0.707-0.707 & 0-0.707 \\ 0.707-0.707 & 0.707-0.707\end{bmatrix}
= \begin{bmatrix}0 & -0.707 \\ 0 & 0\end{bmatrix}
$$
$$
e^{(\cdot)} = \begin{bmatrix}1 & e^{-0.707} \\ 1 & 1\end{bmatrix}
\approx \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix}
$$
$$
\text{row\_sum} = [1 + 0.493,\; 1 + 1] = [1.493,\; 2.000]
$$
$$
l_{\text{new}} = l \cdot e^{m - m_{\text{new}}} + \text{row\_sum}
= [0,0] + [1.493, 2.000] = [1.493, 2.000]
$$

再接下来更新输出 $O$ ，处理 $S_{11}$ 。
初始 $O = \begin{bmatrix}0 & 0 \\ 0 & 0\end{bmatrix}$
$$
e^{S_{11} - m_{\text{new}}} \approx \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix}, \quad
V_1 = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}
$$
$$
\begin{bmatrix}
1 \cdot 1 + 0.493 \cdot 0 & 1 \cdot 0 + 0.493 \cdot 1 \\
1 \cdot 1 + 1 \cdot 0 & 1 \cdot 0 + 1 \cdot 1
\end{bmatrix}
= \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix}
$$
更新 $O$（注意 $O$ 也要乘修正系数 $e^{m - m_{\text{new}}} = [0,0]$）
$$
O \leftarrow 0 + \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix}
= \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix}
$$
****
上述 $K_1$ 相关的已经计算完毕，接下来对 $K_2$ 执行相同步骤。
$K_2 = \begin{bmatrix}1 & 0 \\ 0 & 0\end{bmatrix}$，$K_2^\top = \begin{bmatrix}1 & 0 \\ 0 & 0\end{bmatrix}$
$$
Q_1 K_2^\top = \begin{bmatrix}1 & 0 \\ 0 & 1\end{bmatrix}
\begin{bmatrix}1 & 0 \\ 0 & 0\end{bmatrix}
= \begin{bmatrix}1 & 0 \\ 0 & 0\end{bmatrix}
$$
$$
S_{12} \approx \begin{bmatrix}0.707 & 0 \\ 0 & 0\end{bmatrix}
$$
当前 $m = [0.707, 0.707]$，$l = [1.493, 2.000]$
$$
\text{row\_max}(S_{12}) = [0.707, 0]
$$
$$
m_{\text{new}} = \max([0.707, 0.707], [0.707, 0]) = [0.707, 0.707]
$$
修正系数 $e^{m - m_{\text{new}}} = e^{[0,0]} = [1, 1]$
$$S_{12} - m_{\text{new}} = \begin{bmatrix}0.707-0.707 & 0-0.707 \\ 0-0.707 & 0-0.707\end{bmatrix}
= \begin{bmatrix}0 & -0.707 \\ -0.707 & -0.707\end{bmatrix}$$
$$
e^{S_{12} - m_{\text{new}}}=\begin{bmatrix}1 & 0.493 \\ 0.493 & 0.493\end{bmatrix}
$$
$$
\text{row\_sum} = [1.493,\; 0.986]
$$
$$
l_{\text{new}} = l \cdot [1,1] + \text{row\_sum} = [1.493, 2.000] + [1.493, 0.986] = [2.986, 2.986]
$$
$$
e^{S_{12} - m_{\text{new}}} \approx \begin{bmatrix}1 & 0.493 \\ 0.493 & 0.493\end{bmatrix}, \quad
V_2 = \begin{bmatrix}1 & 1 \\ 0 & 0\end{bmatrix}
$$
$$
\begin{bmatrix}
1 \cdot 1 + 0.493 \cdot 0 & 1 \cdot 1 + 0.493 \cdot 0 \\
0.493 \cdot 1 + 0.493 \cdot 0 & 0.493 \cdot 1 + 0.493 \cdot 0
\end{bmatrix}
= \begin{bmatrix}1 & 1 \\ 0.493 & 0.493\end{bmatrix}
$$
$$
O \leftarrow O \cdot [1,1] = \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix} \quad
$$
$$
O \leftarrow \begin{bmatrix}1 & 0.493 \\ 1 & 1\end{bmatrix} + \begin{bmatrix}1 & 1 \\ 0.493 & 0.493\end{bmatrix}
= \begin{bmatrix}2 & 1.493 \\ 1.493 & 1.493\end{bmatrix}
$$
---
接下来归一化 $Q_1$ 块的输出
$$
O_1 = \frac{O}{l} = \begin{bmatrix}2/2.986 & 1.493/2.986 \\ 1.493/2.986 & 1.493/2.986\end{bmatrix}
\approx \begin{bmatrix}0.670 & 0.500 \\ 0.500 & 0.500\end{bmatrix}
$$
这就是 $Q_1$ 中两个 token 经过完整 softmax 注意力后的输出。
****

补充：离 [原论文](https://arxiv.org/abs/2205.14135) 还差在哪里？

![](posts/migrated/post-images/20260516181328.png)

事实上，
原版算法的 $K/V$ 在外层，$Q$ 在内层。这是为了共用。

原版算法最后才做归一化（$\text{diag}(l_i^{new})^{-1}$ 乘在前面），写到HBM时 $O_i$ 已经是归一化后的值，下一轮循环可以直接使用（不用再除以 $l$），我们这里的简化版算法是在 $Q$ 块全部循环结束后统一进行归一化的。

原版算法有堪称实现灵魂的块大小计算公式 $B_c=\lceil \frac{M}{4d} \rceil$ 和 $B_r = \min(\lceil \frac{M}{4d} \rceil,d)$ ，保证 $Q_i,K_j,V_j,O_i$ 能同时放进SRAM，我们未对这一部分做阐述。

原版用 diag⁡(ℓ)diag(ℓ) 来表达「逐行缩放」，数学上更严谨，也对应代码实现（广播乘法）。
简化用 `O * e^(m - m_new)` 隐式假设逐行乘，没有强调向量和矩阵的广播语义。

## 题目4：PagedAttention的显存管理优势

在生成文本时，每次只生成一个新的token，但做这个token的预测时，需要它之前所有token的 $K$ 和 $V$ 。标准做法是把之前算过的 $K$ 和 $V$ 存起来，避免重复计算，这就是**KV Cache**。

但是，由于每个请求所需要的tokens数未知、有的多有的少，
传统方法是直接给它们分配一块连续的显存，长度设为最大可能值。这需要连续空间、会造成显存浪费、甚至在释放时出现外部碎片，管理不够灵活。
为了解决这一问题，**PagedAttention**把分页管理的思想引入了KV Cache的管理。
****
直接看以下题目。

传统方式：每个请求预先分配最大长度 8 tokens 的连续显存
PagedAttention：block size = 4 tokens，按需动态分配
显卡总 KV Cache：32 tokens（即 8 个 block）
当前有 3 个请求：
请求 A：实际使用 3 tokens
请求 B：实际使用 5 tokens
请求 C：实际使用 2 tokens

1.传统方法分配量和浪费量是多少，浪费率是多少？
每个请求分配8 tokens，请求A浪费5 tokens，请求B浪费3 tokens，请求C浪费6 tokens。
总计分配量是24 tokens，总浪费量是14 tokens，浪费率是58.33%。

2.PagedAttention（Block Size = 4）时，每个请求按需分配block。分配量和浪费量是多少，浪费率是多少？
请求A需要一个block，浪费1 tokens。
请求B需要两个block，浪费3 tokens。
请求C需要一个block，浪费2 tokens。
总分配量为四个block对应16 tokens，总浪费量是6 tokens，浪费率是37.5%。
这显现了PagedAttention可以节省分配量，同时降低浪费。

3.请求B从5 tokens增长到7 tokens，传统方式和PagedAttention是否需要重新分配？如果请求B是从5 tokens增长到9 tokens呢？
对于增长到7 tokens，传统方法和PagedAttention均不需要重新分配。因为预先分配的均已经足够用了。
而对于增长到9 tokens，传统方法需要重新分配更大（16 tokens）的连续空间，并且将原来的5 tokens也拷贝到新空间、再写入新增加的4 tokens；
而PagedAttention只需要动态增加1个block。
这显现了PagedAttention不需要连续内存，动态分配、更加灵活。
## 题目5：Block Table的工作原理

Block Table 实现了逻辑连续、物理不连续的映射，就像操作系统的虚拟内存。

直接看题目。
设定Block Size = 4，请求的 $\text{Block Table} = [3,1,5]$ 。
（表示逻辑块0→物理块3，逻辑块1→物理块1，逻辑块2→物理块5）
1. 画出这个请求的物理布局（哪个物理块存哪几个 token）
2. 要访问 token 索引 9（第 10 个 token），应该去哪个物理块的哪个偏移位置？
3. 如果这个请求共有 10 个 tokens（索引 0-9），最后一个 token（索引 9）在哪个物理
块？这个块是否存满了？

1.按顺序排布各个物理块：
物理块0（无请求）
物理块1（token 4,5,6,7）
物理块2（无请求）
物理块3（token 0,1,2,3）
物理块4（无请求）
物理块5（token 8,9,10,11）
2.访问token索引9时应该去逻辑块 $9 // 4=2$ ，查表对应物理块5，块内偏移为 $9 \% 4=1$ 。
3.同2可知，最后一个token在物理块5，这个块只存了token 8,9，没有存满。

## 题目6：Prefix Cache（前缀共享）的引用计数实现

我们发现很多请求共享相同的前缀。例如：
- 系统 prompt："你是一个 AI 助手"（5 tokens）
- 请求 A："你是一个 AI 助手，今天天气怎么样"（11 tokens）
- 请求 B："你是一个 AI 助手，推荐一部电影"（11 tokens）
两个请求的前 5 个 tokens 完全相同。
传统方式是各自存一份 KV Cache，这会浪费 5 tokens × 2  = 10 tokens。
而Prefix Cache则是只存一份共享的prefix，每个请求的Block Table指向共享blocks，用**引用计数**管理（多个请求共享时，`ref_count > 1`；没有请求使用时才释放）。

根据上述思想，参考自 `nanovllm/engine/block_manager.py` 的简化代码如下：
（思想很简单，就是引用计数，共享的只存一份，每次要分配时先看看是不是已经存过了）
```python
class Block:
	def __init__(self, block_id):
		self.block_id = block_id
		self.ref_count = 0 # 引用计数
		self.hash = -1 # 内容哈希，用于查找共享
		self.token_ids = [] # 实际存储的 tokens
		
# 分配时，先通过哈希查找是否已有相同内容的 block
hash = compute_hash(token_ids, prefix_hash)
if hash in hash_to_block_id:
	block = blocks[block_id]
	block.ref_count += 1 # 共享！只是增加引用
else:
	# 分配新 block
	block = allocate_new_block()
```

设定：
- block_size = 2
- 基础 prefix：tokens `[A, B, C, D]`（需要 2 个 blocks）
- 请求 1：`[A, B, C, D, E, F]`（3 个 blocks）
- 请求 2：`[A, B, C, D, G, H]`（3 个 blocks）
初始状态：空闲 blocks = `[0,1,2,3,4,5,...]` 无限多
问题：
1. 分配基础 prefix（假设还没有人用过），画出两个 block 的 ref_count
2. 分配请求 1，哪些 blocks 是共享的？ref_count 变成多少？
3. 分配请求 2，再次共享 prefix，更新 ref_count
4. 请求 1 结束，deallocate 时，哪些 blocks 的 ref_count 减少？哪些被真正释放？
5. 最终请求 2 的 Block Table 是什么？

**1. 分配基础 prefix**

- Block0：存 `[A, B]`，hash=h_AB，ref_count=1
- Block1：存 `[C, D]`，hash=h_CD，ref_count=1

**2. 分配请求 1（需要 `[A,B,C,D,E,F]`）**

请求 1 的 blocks：
- Block0：`[A,B]`，哈希匹配 → 共享，ref_count=2
- Block1：`[C,D]`，哈希匹配 → 共享，ref_count=2
- Block2：`[E,F]`，新 block，ref_count=1

hash_to_block_id 新增：h_EF → Block2

**3. 分配请求 2（需要 `[A,B,C,D,G,H]`）**

- Block0：`[A,B]`，哈希匹配 → 共享，ref_count=3
- Block1：`[C,D]`，哈希匹配 → 共享，ref_count=3
- Block3：`[G,H]`，新 block，ref_count=1

hash_to_block_id 新增：h_GH → Block3

**4. 请求 1 结束，deallocate**

遍历请求 1 的 Block Table `[0,1,2]`（逆序）：
- Block2：ref_count=1 → 减到 0，释放（从 hash_to_block_id 删除，加入 free list）
- Block1：ref_count=3 → 减到 2（仍被基础 prefix 和请求 2 共享）
- Block0：ref_count=3 → 减到 2（仍被共享）

**5. 请求 2 的最终 Block Table**

```
请求 2 的 Block Table = [0, 1, 3]
```

- Block0（`[A,B]`），Block1（`[C,D]`）仍在，ref_count=2
- Block3（`[G,H]`），ref_count=1

**核心优势**：通过引用计数，我们节省了 2 blocks × 2 = 4 tokens 的显存。实际场景中，系统 prompt 可能很长（如 1000 tokens），共享效果非常显著。

相关：[[softmax|在线 Softmax]]
