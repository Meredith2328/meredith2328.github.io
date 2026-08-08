---
title: 从原始Softmax到在线Softmax
date: 2026-04-09 15:57:34
tags:
- 机器学习
published: true
hideInList: false
feature: null
isTop: false
---

撰写了原始的softmax、数值稳定的softmax、在线softmax的公式及其简单代码呈现。

<!-- more -->

> edit time: 2026-04-09 16:37:03
## softmax形式推导

我们讨论的起点是**原始的softmax形式**：

$$p_j = \frac{e^{z_j}}{\sum_k e^{z_k}}.$$
****
为保证数值稳定，令
$$
m := \max_k z_k,
$$
则 softmax 可等价改写为**数值稳定的softmax形式**：
$$
p_j = \frac{e^{z_j - m}}{\sum_k e^{z_k - m}}.
$$
其实就是给分子分母的 $z$ 先减去 $m$ ，然后再使用exp函数，相当于给 $p_j$ 计算式的分子分母除以 $e^m$ ，计算得到的 $p_j$ 值不变。
这样的好处是，如果某个 $z$ 值非常大，本来exp一下就溢出了（脑补一下指数函数的图像，比较大时能够狠狠地增大数值），可是我们先减了下来再exp，原理上计算得到的 $p_j$ 值不会发生变化。

对其取对数，得到 log-softmax：
$$
\log p_j = z_j - m - \log \sum_k e^{z_k - m}.
$$

其中
$$
\operatorname{LSE}(z) := m + \log \sum_k e^{z_k - m}
$$
称为 log-sum-exp，因此也可写为
$$
\log p_j = z_j - \operatorname{LSE}(z).
$$
****
接下来，我们考虑如何修改为**在线softmax**，以支持FlashAttention的分块计算？

核心是：在有了新块中得分的最大值 $m_i^{new}$ 之后，我们需要把已计算的最大值 $m_i^{(j)}$ 更新为
$$m_i^{(j+1)} \leftarrow \max \{m_i^{(j)}, m_i^{new}\}$$
更新后的 $m$ 可能会影响新的块和已计算的部分的softmax值。因此，需要给已计算过的部分乘以修正系数，并且应该用更新后的 $m$ 计算新的块。
**总之，关键问题是，要用正确的最大值 $m$ 计算softmax。**

详细来看，是以下这样的：
对第 $i$ 个 query，设第 $j$ 轮已经处理完前 $j$ 个列块。定义当前累计最大值为
$$
m_i^{(j)} := \max_{k \le jB_c} s_{ik},
$$
线性归一化项（其实就是分母那一堆e的求和的高级叫法）为
$$
\ell_i^{(j)} := \sum_{k \le jB_c} e^{\,s_{ik} - m_i^{(j)}},
$$
未归一化输出累计量（其实就是没归一化的分子乘积的高级叫法）为
$$
\tilde{o}_i^{(j)} := \sum_{k \le jB_c} e^{\,s_{ik} - m_i^{(j)}} v_k.
$$
因此，当前输出可写为
$$
o_i^{(j)} = \frac{\tilde{o}_i^{(j)}}{\ell_i^{(j)}}.
$$
若第 $j+1$ 个新块对应的 score 集合为 $k \in \text{block}_{j+1}$，记该块内最大值为
$$
m_i^{\mathrm{new}} := \max_{k \in \text{block}_{j+1}} s_{ik}.
$$
则合并后的最大值更新为
$$
m_i^{(j+1)} := \max\{m_i^{(j)},\, m_i^{\mathrm{new}}\}.
$$
由于归一化基准从 $m_i^{(j)}$ 变成了 $m_i^{(j+1)}$，旧块对应的指数项都要乘上修正系数
$$
e^{\,m_i^{(j)} - m_i^{(j+1)}}.
$$

因此，未归一化输出的递推公式为
$$
\tilde{o}_i^{(j+1)}
=
e^{\,m_i^{(j)} - m_i^{(j+1)}} \tilde{o}_i^{(j)}
+
\sum_{k \in \text{block}_{j+1}} e^{\,s_{ik} - m_i^{(j+1)}} v_k.
$$
同理，线性归一化项满足
$$
\ell_i^{(j+1)}
=
e^{\,m_i^{(j)} - m_i^{(j+1)}} \ell_i^{(j)}
+
\sum_{k \in \text{block}_{j+1}} e^{\,s_{ik} - m_i^{(j+1)}}.
$$
最终输出为
$$
o_i^{(j+1)} = \frac{\tilde{o}_i^{(j+1)}}{\ell_i^{(j+1)}}.
$$

当然，若记块内的未归一化输出与归一化项分别为
$$
\tilde{o}_i^{\mathrm{new}}
:=
\sum_{k \in \text{block}_{j+1}} e^{\,s_{ik} - m_i^{(j+1)}} v_k,
$$
$$
\ell_i^{\mathrm{new}}
:=
\sum_{k \in \text{block}_{j+1}} e^{\,s_{ik} - m_i^{(j+1)}},
$$
则也可简写为
$$
\tilde{o}_i^{(j+1)}
=
e^{\,m_i^{(j)} - m_i^{(j+1)}} \tilde{o}_i^{(j)}
+
\tilde{o}_i^{\mathrm{new}},
$$
$$
\ell_i^{(j+1)}
=
e^{\,m_i^{(j)} - m_i^{(j+1)}} \ell_i^{(j)}
+
\ell_i^{\mathrm{new}}.
$$

总之，再来一遍结论。在线 softmax 的关键就在于：
每次加入新块时，都要先用新的全局最大值
$$
m_i^{(j+1)}
$$
重新对旧块和新块做统一归一化，再更新 $\ell_i$ 与 $\tilde{o}_i$，最后得到输出 $o_i$。
## 我怀疑FlashAttention网上/GPT的常见讲解有一处推错的地方

> 省流：结论 $B \approx M/4d$ 没问题，
> 但是我怀疑有些讲解为了推这个结论用到的 $B_r=B_c=B$ 这个假设出发点有问题。
> 只是个人看法，我也不确定自己这么想对不对，
> 欢迎大家在评论区或者Github的 [Issues](https://github.com/Meredith2328/meredith2328.github.io/issues) 页讨论~
### 原始推导的问题

在网上，有些讲解对 $B \approx M/4d$ 这个近似结论的推导是出发自 $B_r=B_c=B$ 的：

记SRAM占用量为：
$$2B_rd+2B_cd+B_rB_c$$
**若 $B_r=B_c=B$ ，则占用 $4Bd+B^2$ ，SRAM大小 $M$ 需满足：**
$$B^2+4Bd \le M$$

> **问题：上述 $B_r=B_c=B$ 条件及其推出的结果 $B^2+4Bd \le M$ 与后续另一条一定满足的条件 $B = \Theta(M/d)$ 是矛盾的。**

原因如下：
当 $B^2+4Bd \le M$ 时，求解取等方程
$$B^2+4Bd=M$$
$$B=-2d+ \sqrt{4d^2+M}$$ （取负舍去）
即有
$$B = \frac{M}{\sqrt{4d^2+M}+2d}$$
**此时若有 $M \ll d^2$ ，才有**
$$B \approx \frac{M}{4d}$$
**这与 $M \gg d^2$ 或 $M = \Theta(nd), n \gg d$ 这一长上下文肯定满足的条件恰好是相反的。**

总之，按照原文来说，上述 $B_r=B_c=B$ 假设是与原文条件矛盾的推导。
### 不使用 $B_r=B_c=B$ ，推导得到 $B_c=\Theta(M/d)$

应该保留原文的**长方形**分块 $B_r$ 和 $B_c$ ，即按照下述流程推导：

根据每次迭代在SRAM中需要存储的内容，有
$$Q_i,O_i \in \mathbb{R}^{B_r \times d}, \qquad K_j,V_j \in \mathbb{R}^{B_c \times d}, \qquad S_{ij}\in \mathbb{R}^{B_r\times B_c}.$$
故SRAM中需要同时容纳的主要对象对应三类约束：
$$B_cd=O(M), \qquad B_rd=O(M), \qquad B_rB_c=O(M).$$
因此我们正确地**得到 $B_c$ 满足的条件**：
$$B_c=\Theta(M/d)$$
****
代入约束 $B_rB_c=O(M)$ ，得到
$$B_r=O(d).$$

另一方面，由第二条约束可得
$$B_r=O(M/d).$$

因此综合**得到 $B_r$ 满足的条件**：
$$B_r=\Theta\!\bigl(\min(M/d,\ d)\bigr).$$
****
验证上述两条条件与 $M$ 的假设相容：
在FlashAttention原文关注的情况下，通常满足以下假设
$$d \le M \le nd,$$
并且长上下文时常满足
$$M \gg d^2.$$
此时
$$M/d \gg d,$$
所以
$$B_r=\Theta(d), \qquad B_c=\Theta(M/d).$$
这时并不存在之前正方形分块下的矛盾，因为原文采用的是长方形分块：
行块高度只有 $\Theta(d)$；列块宽度可以达到 $\Theta(M/d)$。
于是中间块大小为
$$B_rB_c=\Theta(d)\cdot \Theta(M/d)=\Theta(M),$$
恰好仍能放入SRAM。
****
接下来就可以继续后续的推导，
把上述的条件 $B_c=\Theta(M/d)$ 代回我们在 ii 中推导的
$$\text{总 HBM IO}=O(\frac{n^2d}{B_c}+nd)$$
即有
$$\text{IO}=O(nd)$$
等等。

## softmax实际代码实现

接下来联系到实际的代码实现，特别是softmax和log-sum-exp的PyTorch实现及其与交叉熵损失和FlashAttention的关系。

标准的数值稳定softmax应该为：
总之就是**首先需要计算一个最大值**，然后计算减去最大值后的softmax。

```python
import torch

def softmax_stable(logits, dim=-1):
    """
    logits: [..., n]
    return: [..., n] 概率分布
    """
    # 减去最大值防止溢出
    max_val = torch.max(logits, dim=dim, keepdim=True)[0]
    exp_logits = torch.exp(logits - max_val)
    sum_exp = torch.sum(exp_logits, dim=dim, keepdim=True)
    return exp_logits / sum_exp

# PyTorch 内置版本（推荐，数值更稳定）
# attn_weights = torch.softmax(scores, dim=-1)
```

而交叉熵损失则为：

```python
def cross_entropy_loss(logits, labels):
    """
    logits: [batch_size, num_classes] 原始输出（未经过 softmax）
    labels: [batch_size] 真实类别索引 (0 ~ num_classes-1)
    """
    # 先算 log_softmax（数值稳定）
    max_val = torch.max(logits, dim=1, keepdim=True)[0]
    exp_logits = torch.exp(logits - max_val)
    sum_exp = torch.sum(exp_logits, dim=1, keepdim=True)
    log_probs = logits - max_val - torch.log(sum_exp)  # log(softmax)
    
    # 取出正确类别的 log 概率
    batch_size = logits.shape[0]
    correct_log_probs = log_probs[range(batch_size), labels]
    
    return -correct_log_probs.mean()

# PyTorch 内置版本（推荐，数值更稳定）
# loss_fn = torch.nn.CrossEntropyLoss()  # 内部自动做 log_softmax + NLLLoss
```

在线Softmax的核心实现则为：
其中 $B_r$ 是行row的块大小（即 $Q$ 的块大小，因为是 $QK^T$ ），
$B_c$ 是列column的块大小。

```python
def flash_attention_online_softmax(Q, K, V, B_r, B_c):
    """
    B_r: Q 的块大小，B_c: K/V 的块大小
    Q, K, V: [n, d] 假设 batch=1, heads=1 简化
    """
    n, d = Q.shape
    O = torch.zeros_like(Q)  # 输出累加器
    l = torch.zeros(n, 1)    # 指数和统计量
    m = torch.full((n, 1), -float('inf'))  # 最大值统计量
    
    # 外层循环：遍历 KV 块
    for j in range(0, n, B_c):
        Kj = K[j:j+B_c]  # [B_c, d]
        Vj = V[j:j+B_c]  # [B_c, d]
        
        # 内层循环：遍历 Q 块
        for i in range(0, n, B_r):
            Qi = Q[i:i+B_r]  # [B_r, d]
            Oi = O[i:i+B_r]  # [B_r, d]
            mi = m[i:i+B_r]  # [B_r, 1]
            li = l[i:i+B_r]  # [B_r, 1]
            
            # 计算当前块的得分矩阵 [B_r, B_c]
            Sij = torch.matmul(Qi, Kj.T) / (d ** 0.5)
            
            # 当前块的最大值（每行）
            mij_new = torch.max(Sij, dim=1, keepdim=True)[0]  # [B_r, 1]
            
            # 当前块的指数和（以块内最大值归一化）
            Pij = torch.exp(Sij - mij_new)  # [B_r, B_c]
            lij_new = torch.sum(Pij, dim=1, keepdim=True)  # [B_r, 1]
            
            # 当前块的加权输出（块内）
            Oij_new = torch.matmul(Pij, Vj)  # [B_r, d]
            
            # ========== 在线 softmax 合并 ==========
            # 更新全局最大值
            m_new = torch.maximum(mi, mij_new)  # [B_r, 1]
            
            # 缩放旧统计量
            scale_old = torch.exp(mi - m_new)   # [B_r, 1]
            scale_new = torch.exp(mij_new - m_new)  # [B_r, 1]
            
            # 更新指数和
            l_new = scale_old * li + scale_new * lij_new  # [B_r, 1]
            
            # 更新输出（关键：旧的输出需要按比例缩放）
            O_new = (scale_old * Oi * li + scale_new * Oij_new) / l_new
            
            # 写回
            O[i:i+B_r] = O_new
            m[i:i+B_r] = m_new
            l[i:i+B_r] = l_new
    
    return O
```

## 手推小例子

---

1. 标准 Softmax 数值稳定计算

给定 `logits = [2.0, 1.0, 0.1]`，写出数值稳定的 softmax 计算过程。

解：
```
max = 2.0
logits - max = [0.0, -1.0, -1.9]
exp = [e^0, e^{-1}, e^{-1.9}] = [1.0000, 0.3679, 0.1496]
sum_exp = 1.5175
softmax = [1/1.5175, 0.3679/1.5175, 0.1496/1.5175] = [0.6590, 0.2424, 0.0986]
```

验证和 = `1.0000`

答：`p = [0.6590, 0.2424, 0.0986]`

---

2. 交叉熵损失计算

设模型输出 `logits = [2.0, 1.0, 0.1]`，真实标签为类别 `0` ，计算交叉熵损失。

解：
```
softmax 结果 p = [0.6590, 0.2424, 0.0986]
正确类别的概率 p_c = 0.6590
L = -log(p_c) = -log(0.6590) = 0.4170
```

答：`L = 0.4170`

---

3. 标准 Attention 中的 Softmax

已知 Q, K, V 如下（n=3, d=2），计算 Attention 输出。
```
Q = [[1.0, 0.5],
     [0.5, 1.0],
     [0.0, 1.0]]

K = [[0.8, 0.6],
     [0.3, 0.9],
     [1.0, 0.2]]

V = [[0.5, 1.0],
     [0.8, 0.3],
     [0.2, 0.7]]
     
sqrt(d) = sqrt(2) = 1.4142
```

第一步：计算 `S = QK^T / sqrt(d)`

```
QK^T = 
行0·K^T: [1.0*0.8+0.5*0.6=1.1, 1.0*0.3+0.5*0.9=0.75, 1.0*1.0+0.5*0.2=1.1]
行1·K^T: [0.5*0.8+1.0*0.6=1.0, 0.5*0.3+1.0*0.9=1.05, 0.5*1.0+1.0*0.2=0.7]
行2·K^T: [0.0*0.8+1.0*0.6=0.6, 0.0*0.3+1.0*0.9=0.9, 0.0*1.0+1.0*0.2=0.2]

S = 除以 1.4142：
行0: [1.1/1.4142=0.7778, 0.75/1.4142=0.5303, 1.1/1.4142=0.7778]
行1: [1.0/1.4142=0.7071, 1.05/1.4142=0.7425, 0.7/1.4142=0.4950]
行2: [0.6/1.4142=0.4243, 0.9/1.4142=0.6364, 0.2/1.4142=0.1414]
```

第二步：每行 softmax

```
行0: max=0.7778, 减后=[0, -0.2475, 0], exp=[1, 0.7808, 1], sum=2.7808, p=[0.3596, 0.2808, 0.3596]
行1: max=0.7425, 减后=[-0.0354, 0, -0.2475], exp=[0.9652, 1, 0.7808], sum=2.7460, p=[0.3515, 0.3642, 0.2843]
行2: max=0.6364, 减后=[-0.2121, 0, -0.4950], exp=[0.8088, 1, 0.6098], sum=2.4186, p=[0.3344, 0.4135, 0.2521]
```

第三步：O = P × V

```
O[0] = 0.3596×[0.5,1.0] + 0.2808×[0.8,0.3] + 0.3596×[0.2,0.7]
     = [0.1798,0.3596] + [0.2246,0.0842] + [0.0719,0.2517] = [0.4763, 0.6955]
O[1] = 0.3515×[0.5,1.0] + 0.3642×[0.8,0.3] + 0.2843×[0.2,0.7]
     = [0.1758,0.3515] + [0.2914,0.1093] + [0.0569,0.1990] = [0.5241, 0.6598]
O[2] = 0.3344×[0.5,1.0] + 0.4135×[0.8,0.3] + 0.2521×[0.2,0.7]
     = [0.1672,0.3344] + [0.3308,0.1241] + [0.0504,0.1765] = [0.5484, 0.6350]
```

答：`O = [[0.4763, 0.6955], [0.5241, 0.6598], [0.5484, 0.6350]]`

---

4. 在线 Softmax 合并（一个 query，两个块）

```
完整 scores = [2.0, 1.5, 3.0, 0.5]
V = [[1.0, 0.0], [0.5, 0.5], [0.0, 1.0], [0.8, 0.2]]
```

(1) 标准方法（全局 softmax）

```
max = 3.0
exp(减max后) = [e^{-1}, e^{-1.5}, e^{0}, e^{-2.5}] = [0.3679, 0.2231, 1.0000, 0.0821]
sum_exp = 1.6731
probs = [0.2199, 0.1334, 0.5977, 0.0491]
output = 0.2199×[1,0] + 0.1334×[0.5,0.5] + 0.5977×[0,1] + 0.0491×[0.8,0.2]
      = [0.2199,0] + [0.0667,0.0667] + [0,0.5977] + [0.0393,0.0098]
      = [0.3259, 0.6742]
```

(2) 在线方法

```
初始化：m = -∞, l = 0, o = [0,0]

块1：s=[2.0,1.5], v=[[1,0],[0.5,0.5]]
m1=2.0, exp(减2)=[1,0.6065], l1=1.6065
o1 = (1/1.6065)×[1,0] + (0.6065/1.6065)×[0.5,0.5] = [0.6225,0] + [0.1887,0.1887] = [0.8112,0.1887]

合并：m_new = max(-∞,2)=2, scale_old=0, scale_new=1
l = 0 + 1×1.6065 = 1.6065
o = (0 + 1×[0.8112,0.1887]×1.6065) / 1.6065 = [0.8112,0.1887]

块2：s=[3.0,0.5], v=[[0,1],[0.8,0.2]]
m2=3.0, exp(减3)=[1,0.0821], l2=1.0821
o2 = (1/1.0821)×[0,1] + (0.0821/1.0821)×[0.8,0.2] = [0,0.9241] + [0.0607,0.0152] = [0.0607,0.9393]

合并：m_prev=2, m_new=max(2,3)=3
scale_old = e^{2-3}=0.3679, scale_new = e^{3-3}=1
l = 0.3679×1.6065 + 1×1.0821 = 0.5910 + 1.0821 = 1.6731
o = (0.3679×[0.8112,0.1887]×1.6065 + 1×[0.0607,0.9393]×1.0821) / 1.6731
  = (0.3679×[1.3030,0.3031] + [0.0657,1.0165]) / 1.6731
  = ([0.4793,0.1115] + [0.0657,1.0165]) / 1.6731
  = [0.5450, 1.1280] / 1.6731 = [0.3257, 0.6742]
```

答：在线方法得到 `[0.3257, 0.6742]`，与标准方法的 `[0.3259, 0.6742]` 一致（误差 < 1e-4）。
