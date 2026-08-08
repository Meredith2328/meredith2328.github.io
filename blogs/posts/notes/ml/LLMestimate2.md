---
title: 怎么估算LLM训练的内存和计算需求？推一推、测一测
date: 2026-03-12 19:01:53
tags:
- 大模型
published: true
hideInList: false
feature: null
isTop: false
---
本部分适合于知道AdamW更新流程、但没有尝试推导过peak memory和计算量、计算时间的朋友。

省流：

$$A_{per\_layer} ≈ 9BLd + 2BhL^2$$

$$C ≈ 6 × P × D$$

<!-- more -->

> 上接前文： [怎么估算LLM的参数量和FLOPs？推一推、测一测 | 十派的玩具箱](https://meredith2328.github.io/post/LLMestimate/)
> 本部分推导与验证的公式基于**激活值不会提前释放、而是全部保留**的假设，得到了 $A_{per\_layer} \approx 16BLd+2BhL^2$ 的结论，后续实测也是基于这个结论。另外引言中的 $C \approx 6 × P × D$ 指计算量约等于六倍的参数量乘以训练token数。
> 事实上，许多中间值通常在后续层进行计算时就已经释放了，相关讨论在 (a) 的“如果会提前释放，不同时保存所有激活值？”部分，结论应为 $A_{per\_layer}=9BLd+2BhL^2$ 。
> 撰写过程中借助了DeepSeek v3.2生成相关代码、以及处理一部分计算工作。
> 另外，本篇只是个人基于现在已知的知识做的具有阶段性、一定合理性的推测，不代表真正的事实：不代表PyTorch、CUDA的实际工程实现。后者还需要更多的调查研究才能得出更好的结论。
> edit time: 2026-03-13 11:12:50

## 原始问题整理

> 来自CS336。自己翻的，可能有错，欢迎在 [Issues · Meredith2328/meredith2328.github.io](https://github.com/Meredith2328/meredith2328.github.io/issues) 指正。

Problem (adamwAccounting): Resource accounting for training with AdamW
接下来我们计算一下使用AdamW需要多少内存和计算。tensor一律使用float32。

**(a) 运行AdamW的peak memory是多少？**

（内存需求=参数+激活值+梯度+优化器状态，基于 `batch_size` 和 `(vocab_size, context_length, num_layers, d_model, num_heads)` ，假设 `d_ff = 4 × d_model` ）

只考虑以下部分：

- Transformer block
  - RMSNorm(s)
  - Multi-head self-attention sublayer: QKV projections, $Q^TK$ matrix multiply, softmax, weighted sum of values, output projection.
  - Position-wise feed-forward: W1 matrix multiply, SiLU, W2 matrix multiply
- final RMSNorm
- output embedding
- cross-entropy on logits

**(b) 对于GPT-2 XL-shaped model，回答(a)。在80GB内存的前提下，最大可用的batch size是多少？**

**(c) 运行AdamW的一个step需要多少的FLOPs？**

**(d)** Model FLOPs utilization (MFU)定义为 the ratio of observed throughput (tokens per second) / the hardware’s theoretical peak FLOP throughput [Chowdhery et al., 2022] 。单台NVIDIA A100 GPU对于float32操作的理论峰值是19.5T FLOPs。**假设你能获得50%的MFU，在单台NVIDIA A100 GPU上训练GPT-2 XL需要多少天**（400K steps，batch size 1024）？

（基于 [Kaplan et al. ,2020] and [Hoffmann et al. ,2022] ，假设反向FLOPs是前向FLOPs的两倍）

## (a) 运行AdamW的peak memory是多少？

记 `B = batch_size, V = vocab_size, T = context_length, L = num_layers, D = d_model, H = num_heads, D_ff = 4D` 。

peak memory由参数+激活值+梯度+优化器状态四部分组成： `M_total = M_params + M_acts + M_grads + M_opt` 。

所有tensor都是float32，所以每个元素应为4 bytes。

### 参数量

**参数量**如果按 [以前推导过的参数量估算公式](https://meredith2328.github.io/post/LLMestimate/) 来，则有：（假设embedding层和LM Head参数共享，$d_{ff}=4d$ ，RMS Norm的参数量忽略不计）
$$P=12Nd^2+Vd$$
用上面的记号就是：
```
P=12LD^2+VD
```
### 激活值

激活值指某层的输出值，激活量指某层的输出值的数量。
（但其实实际语境中分得没有这么清，可以从上下文判断指的是数量还是值）
- RMS Norm输出矩阵为 `(B, T, D)` ，输出矩阵元素数量应为 `BTD` ；
- Q、K、V 是 `(B, T, D) × (D, D) = (B, T, D)` ，输出数量均为 `BTD` ；
- QK\^T 是 `(B, H, T, D/H) × (B, H, D/H, T)` ，输出数量为 `BHT^2` 。
- AttnV 是 `(B, H, T, T) × (B, H, T, D/H)` ，输出数量为 `BTD` 。
- O是 `(B, T, D) × (D, D) = (B, T, D)` ，输出数量为 `BTD` 。
- FFN第一步是 `(B, T, D) × (D, 4D) = (B, T, 4D)` ，输出数量为 `4BTD` 。
- FFN第二步是SiLU： `(B, T, 4D)` 和它的 sigmoid 的逐元素相乘，输出数量为 `4BTD` 。（注意不考虑Gate，因为使用的是SiLU而不是SwiGLU，只有两个W）
- FFN第三步是 `(B, T, 4D) × (4D, D) = (B, T, D)` ，输出数量为 `BTD` 。
- output embedding是 `(B, T, D) × (D, V)` ，输出数量为 `BTV` 。
- CrossEntropyLoss在分析中间最大激活值内存（peak memory）时，首先对输入的logits `(B, T, V)`做一个softmax，这里得到了 `BTV` 。然后对于 `(B, T)` 个label，取对应label位置的负对数，求平均得到标量loss。peak memory意味着只要计算出了一团新的东西，我们就要把它考虑在内。所以应为 `BTV` 。

其余同理，慢慢算一下。
我们按照题目要求细细算一下一个Transformer Block的激活值：
```
A_block
## RMS Norm 1
= (BTD) 
## MHA
+ 3(BTD)   # Q, K, V
+ (BHT^2)  # QK^T
+ (BHT^2)  # softmax
+ (BTD)    # AttnV
+ (BTD)    # O
## RMS Norm 2
+ (BTD)
## FFN
+ (4BTD)   # W1
+ (4BTD)   # SiLU
+ (BTD)    # W2
= 16BTD + 2BHT^2
```

因此，**全模型激活**应该为：
```
A
= L(16BTD + 2BHT^2)  # L layers of A_block
+ BTD                # final RMSNorm
+ BTV                # output embedding
+ BTV                # CrossEntropyLoss
= L(16BTD + 2BHT^2) + BTD + 2BTV
```

考虑到 `BTD << LBTD` ，可以略微简化为
```
A = L(16BTD + 2BHT^2) + 2BTV
```
### peak memory

**梯度**等于参数量。
```
G = P
```

根据附录A里的实现，AdamW优化器每个参数都有两个同形状的张量 `m` 和 `v` ，外加一个可以忽略的标量 `step` 。所以AdamW优化器状态：
```
O = 2P
```

再代入每个元素4 Bytes，有：（单位为Bytes）
```
M_params = 4P
M_acts   = 4A
M_grads  = 4P
M_opt    = 8P
```

故peak memory应为：
```
M_total = M_params + M_acts + M_grads + M_opt
        = 16P + 4A
# P = 12LD^2+VD
# A = L(16BTD + 2BHT^2) + BTD + 2BTV
        = 16(12LD^2+VD) + 4(L(16BTD + 2BHT^2) + 2BTV)
        = 192LD^2 + 16VD + 64LBTD + 8LBHT^2 + 8BTV
```

注意， `M_total = 16P + 4A` 这个整体系数4是来自于FP32每个元素4 Bytes的前提假设的。
因此我们可以很方便地去估算别的：比如FP16等等。
### 如果会提前释放，不同时保存所有激活值？

在机器学习系统的课程上，有这样一个PPT引起了我的疑惑。
![](posts/migrated/post-images/20260312234704.png)

把它的内容转写下来：
$d = 2048$ (hidden dimension), $N = 24$ (layers), $V = 50,000$ (vocab size),
$B = 8$ (batch size), $L = 1024$ (sequence length), $h = 16$ (attention heads).
- Parameters: $12Nd^2+Vd$
- Forward activations: $9BLd+2BhL^2$ per layer
- Backpropagation: ~ 2-3× activations + gradients + optimizer states
Example (d=2048, N=24, L=1024, B=8, h=16, V=50k):
- Parameters: ≈ 1.31B (≈ 2.4 GB in FP16, ≈ 21 GB with Adam states)
- Forward activations: ≈ 18.7 GB
- Backprop: ≈ 40-75 GB

它为什么是以下两个公式呢？
$$P=12Nd^2+Vd$$
$$A_{per\_layer}=9BLd+2BhL^2$$
注意到，这里与我们推得的公式唯一区别就在于这个 **9** 。
恰好我对数字很敏感，意识到它是4+4+1——峰值激活值只计入了FFN里面的。
我们知道，Transformer块里面一层一层是顺序执行的，按理说计算到后面的时候，前面的就可以释放了。所以就有了这样的公式。

## (b) 对于GPT-2 XL-shaped model，回答(a)。在80GB内存的前提下，最大可用的batch size是多少？

### GPT2-XL代入计算

[GPT2-XL](https://huggingface.co/openai-community/gpt2-xl)
```
GPT2-XL
V = vocab_size: 50257
T = context_length: 1024
L = num_layers: 48
D = d_models: 1600
H = num_heads: 25
D_ff = 4D
```

代入(a)得到的 `M_total = 16P + 4A = 192LD^2 + 16VD + 64LBTD + 8LBHT^2 + 8BTV` 有：
```
M_total = 192 * 48 * 1600 * 1600 + 16 * 50257 * 1600 + 64 * 48 * B * 1024 * 1600 + 8 * 48 * B * 25 * 1024 * 1024 + 8 * B * 1024 * 50257
        = 23592960000 + 1286579200 + 5033164800B + 10066329600B + 411705344B
        = 24 879 539 200 + 15 511 199 744B
        ≈ (24.88 + 15.51 batch_size) GB
```

即最终的结论：（单位为GB）
$$M_{total}(batch\_size)=24.88+15.51 \times batch\_size$$

这么看来，在80GB内存的前提下，最大可用的batch_size不超过 (80-24.88)/15.51≈3.55 。在单卡条件下，最大的batch_size为3。
### 使用GPT2-small实际环境验证上述公式

> TODO 本部分的验证似乎有一定问题，之后会重写本部分。

GPT2-XL的实机验证有心无力。我的5090显卡显存为32GB，而上述峰值内存即使 `batch_size = 1` 也要40GB。
因此换用以下GPT2家族其他模型的参数，重新计算一下并实际跑一下看看：
```
vocab_size = 50257
d_ff = 4 \times d_model
context length = 1024

GPT-2 small  (12 layers, 768  d_model, 12 heads)
GPT-2 medium (24 layers, 1024 d_model, 16 heads)
GPT-2 large  (36 layers, 1280 d_model, 20 heads)
GPT-2 XL     (48 layers, 1600 d_model, 25 heads)
```

实际验证结果如下（代码、详细结果及说明见附录B）。
发现PyTorch运行的内存峰值比我们算的要高效不少。在已经显式禁用梯度检查点（gradient checkpointing）的情况下，仍然比我们计算的值节省了4.20-2.47=1.73 GB，这对于GPT2-small这样一个峰值显存为3~4GB的模型是很好的。

```
Using device: cuda
GPU: Tesla P100-PCIE-16GB
Total GPU memory: 17.06 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   2.47       4.20       41.2% 
MEDIUM   353.5M   6.17       10.90      43.4% 
LARGE    772.1M   12.56      21.83      42.5% 
============================================================
```

## (c) 运行AdamW的一个step需要多少的FLOPs？

先根据附录A中的AdamW代码实现，详细地数AdamW一次优化器更新需要的FLOPs，后面再加上前向和后向的FLOPs，得到一个step完整的FLOPs。

一阶矩更新：3FLOPs/元素（ `m <- beta1 * m + (1 - beta1) * g` ）
```python
state['m'].mul_(beta1).add_(grad, alpha=1 - beta1)
```
对每个元素， `beta1 * m` ， `(1 - beta1) * g` 和这两项相加共计三次运算。
ps. 1 - beta1是整个参数张量各个元素共用的，虽然也需要一次计算，但并不是每次元素运算都需要重新计算。因此，这里不需要计入。后续偏差修正、step_size同理。

二阶矩更新：4FLOPs/元素（ `v <- beta2 * v + (1 - beta2) * g * g` ）
```python
state['v'].mul_(beta2).addcmul_(grad, grad, value=1 - beta2)
```
`beta2 * v` ， `g * g` ，再乘 `1 - beta2` ，再加起来。

分母构造：2FLOPs/元素 （ `denom <- sqrt(v) + eps` ）
```python
denom = state['v'].sqrt().add_(eps)
```
`sqrt(v)` ，`+ eps` 。

参数Adam更新：3FLOPs/元素 （ `p <- p + (-step_size) * m / denom` ）
```python
p.data.addcdiv_(state['m'], denom, value=-step_size)
```
`m / denom` ，加上 `-step_size` ，加上 `p` 。

解耦权重衰减：2FLOPs/元素（ `p <- p + (-lr * weight_decay) * p` ）
```python
p.data.add_(p.data, alpha=-lr * weight_decay)
```
`(-lr * weight_decay) * p` ， 加上 `p` 。注意 `-lr` 和 `weight_decay` 是标量。

总之，有运行AdamW一次优化器更新需要14 FLOPs。
```
F_AdamW_step ≈ 14P
```

注意，一个step前向的过程包括了前向和后向所包含的各种矩阵乘法（见下），再加上这里提到的优化器更新的过程。前者随着 `B` 、 `L` 、 `D` 等因素增长，而后者只与 `P` 线性相关。训练时只要 `B` 和 `T` 不是特别小，矩阵乘的 FLOPs 会远大于 AdamW 更新。

如果完整加起来，应该为
```
F_step ≈ 3F_fwd + F_AdamW_step
```
其中 `3F_fwd` 是因为 backward 约等于 forward 的 2 倍，`14P` 是优化器更新本身。实际里 `14P` 相比 `3F_fwd` 很小，通常可忽略。

精确推导 `F_fwd`（ [怎么估算LLM的参数量和FLOPs？推一推、测一测 | 十派的玩具箱](https://meredith2328.github.io/post/LLMestimate/#%E6%80%8E%E4%B9%88%E4%BC%B0%E7%AE%97llm%E7%9A%84%E8%AE%AD%E7%BB%83flops) ）的话，有
```
F_fwd ≈ L(24BTD^2 + 4BT^2D) + 2BTVD
```
（当然 `3F_fwd` 也可以使用经验公式 `6 × 参数量 × 训练 token 数` 进行近似。）
## (d) 在单台NVIDIA A100 GPU上训练GPT-2 XL需要多少天？

> 本部分数值是GPT算的，本人没有核对。

先算 GPT-2 XL、B = 1024 的 forward FLOPs：

```
F_fwd(step)
= 1024 * (48 * (24 * 1024 * 1600^2 + 4 * 1024^2 * 1600) + 2 * 1024 * 50257 * 1600)
= 3590864450355200
= 3.5908644503552e15
```

训练一步：

```
F_train(step)
≈ 3 * F_fwd(step)
= 1.07725933510656e16 FLOPs
```

A100 的 float32 峰值是 19.5e12 FLOP/s。  
50% MFU 下的有效吞吐：

```
0.5 * 19.5e12 = 9.75e12 FLOP/s
```

400K steps 的总时间：

```
time
= 400000 * 1.07725933510656e16 / 9.75e12
= 4.4195e8 s
≈ 5115 days
≈ 14.0 years
```

所以答案是：大约 5115 天，约 14 年。

利用Python进行验证：
```
>>> 1024 * (48 * (24 * 1024 * 1600 * 1600 + 4 * 1024 * 1024 * 1600) + 2 * 1024 * 50257 * 1600)
3590864450355200
>>> a = 1024 * (48 * (24 * 1024 * 1600 * 1600 + 4 * 1024 * 1024 * 1600) + 2 * 1024 * 50257 * 1600)
>>> 3 * a
10772593351065600
>>> 3 * a * 400000 / 9.75e12
441952547.7360246
>>> 3 * a * 400000 / 9.75e12 / 3600 / 24
5115.191524722507
```
## 附录A: AdamW代码实现

![](posts/migrated/post-images/20260311191813.png)

```python
class AdamW(torch.optim.Optimizer):

    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01):
        defaults = dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay)
        super().__init__(params, defaults)
    
    def step(self, closure=None):
        loss = None
        if closure is not None:
            loss = closure()
        
        for group in self.param_groups:
            beta1, beta2 = group['betas']
            lr = group['lr']
            eps = group['eps']
            weight_decay = group['weight_decay']
            
            for p in group['params']:
                if p.grad is None:
                    continue
                
                grad = p.grad.data
                
                # 初始化状态
                state = self.state[p]
                if len(state) == 0:
                    state['step'] = 0
                    state['m'] = torch.zeros_like(p.data)  # 一阶矩
                    state['v'] = torch.zeros_like(p.data)  # 二阶矩
                
                # 更新步数
                state['step'] += 1
                t = state['step']
                
                # 更新矩估计
                state['m'].mul_(beta1).add_(grad, alpha=1 - beta1)
                state['v'].mul_(beta2).addcmul_(grad, grad, value=1 - beta2)
                
                # 偏差修正
                bias_correction1 = 1 - beta1 ** t
                bias_correction2 = 1 - beta2 ** t
                
                # Adam更新
                denom = state['v'].sqrt().add_(eps)
                step_size = lr * (bias_correction2 ** 0.5) / bias_correction1
                p.data.addcdiv_(state['m'], denom, value=-step_size)
                
                # 权重衰减（解耦）
                if weight_decay != 0:
                    p.data.add_(p.data, alpha=-lr * weight_decay)
        
        return loss
```

## 附录B: peak memory验证程序与结果

通过以下实验验证，发现对于GPT-2 SMALL/MEDIUM/LARGE，实际的内存占用均为我们预估值的41-43%左右，这个比例非常稳定（无论设备、模型大小），可能来自于各种各样的工程优化，可以直接作为修正系数，初步显示我们的预估公式的可用性。
按理说，实际值一定是比我们的预估值小的，因为降低内存占用是很关键的工程需求，一定会有各种各样的优化（PyTorch、CUDA、操作系统、硬盘等等），同时内存占用也可能受到各种难以仔细分析的因素的影响。我们能够获得一个大致稳定的估算公式，应该已经还可以了。

****

以下是来自colab的三次Tesla T4验证结果。

```
Using device: cuda 
GPU: Tesla T4 
Total GPU memory: 15.64 GB
============================================================
 Validation Results (FP32) ============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------ 
SMALL    123.5M   8.99       4.20       114.0% 
MEDIUM   353.5M   6.23       10.90      42.8% 
LARGE    772.1M   12.60      21.83      42.3% ============================================================
```

```
Using device: cuda 
GPU: Tesla T4 
Total GPU memory: 15.64 GB
============================================================ 
Validation Results (FP32) ============================================================ 
Model    Params   Actual(GB) Pred(GB)   Error
------------------------------------------------------------ 
SMALL    123.5M   2.48       4.20       40.9% 
MEDIUM   353.5M   6.20       10.90      43.2% 
LARGE    772.1M   12.60      21.83      42.3% ============================================================
```

```
Using device: cuda 
GPU: Tesla T4 
Total GPU memory: 15.64 GB
============================================================ 
Validation Results (FP32) ============================================================ 
Model    Params   Actual(GB) Pred(GB)   Error
------------------------------------------------------------ 
SMALL    123.5M   9.01       4.20       114.5% 
MEDIUM   353.5M   6.22       10.90      42.9% 
LARGE    772.1M   12.60      21.83      42.3% ============================================================
```

****

以下是来自Kaggle的三次Tesla P100验证结果。

```
Using device: cuda
GPU: Tesla P100-PCIE-16GB
Total GPU memory: 17.06 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   2.47       4.20       41.2% 
MEDIUM   353.5M   6.17       10.90      43.4% 
LARGE    772.1M   12.56      21.83      42.5% 
============================================================
```

```
Using device: cuda
GPU: Tesla P100-PCIE-16GB
Total GPU memory: 17.06 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   2.47       4.20       41.2% 
MEDIUM   353.5M   6.17       10.90      43.4% 
LARGE    772.1M   12.56      21.83      42.5% 
============================================================
```

```
Using device: cuda
GPU: Tesla P100-PCIE-16GB
Total GPU memory: 17.06 GB

============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   8.97       4.20       113.6%
MEDIUM   353.5M   6.22       10.90      42.9% 
LARGE    772.1M   12.56      21.83      42.4% 
============================================================
```

****

以下是来自Kaggle的三次Tesla T4验证结果。

```
Using device: cuda
GPU: Tesla T4
Total GPU memory: 15.64 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   2.47       4.20       41.2% 
MEDIUM   353.5M   6.17       10.90      43.4% 
LARGE    772.1M   12.56      21.83      42.5% 
============================================================
```

```
Using device: cuda
GPU: Tesla T4
Total GPU memory: 15.64 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   8.99       4.20       114.2%
MEDIUM   353.5M   6.20       10.90      43.1% 
LARGE    772.1M   12.57      21.83      42.4% 
============================================================
```

```
Using device: cuda
GPU: Tesla T4
Total GPU memory: 15.64 GB
============================================================
Validation Results (FP32)
============================================================
Model    Params   Actual(GB) Pred(GB)   Error 
------------------------------------------------------------
SMALL    123.5M   8.99       4.20       114.1%
MEDIUM   353.5M   6.20       10.90      43.1% 
LARGE    772.1M   12.56      21.83      42.4% 
============================================================
```

****

关于异常值（GPT-2 SMALL的 `Actual 8.99GB` ）：

我发现SMALL的这个有一定规律性。我固定了GPU（Tesla T4，Total GPU memory: 15.64 GB），在启动机器之后，利用连续的cell运行完全相同的代码三次。第一次运行时权重从网上下载，此时运行分配的SMALL是2.47GB，连着第二次运行时SMALL稳定飙升到8.99GB，第三次也是8.99GB左右。

我尝试静置五分钟（运行时没有关闭、仍然停在运行完之前代码的状态），再新建一个cell跑，第四次仍然是8.99GB左右。

我的看法是，它似乎是各次运行循环互相之间有影响，而且基本上只影响到了SMALL。不知道是哪一环——把跟SMALL无关的内存消耗算进去了？各个运行之间互相有影响？我静置个很久（比如1h）就会不一样？

但不得不说，排除掉这个导致110%的8.99GB异常，三个模型40%、41%、42%这样的比例极其稳定。

****

验证代码如下。
最关键的是
```python
model.gradient_checkpointing_disable()
model = model.to(device)
```

这两行代码。后者移入GPU中分配内存并进行训练，前者GPT说是如果不关闭则可能在运行过程中不会完全保留激活值、而是实时清理。

```python
from transformers import GPT2LMHeadModel
import torch

# ==================== 配置开关 ====================
RUN_CONFIG = {
    'small': True,   # gpt2
    'medium': True,  # gpt2-medium
    'large': True,   # gpt2-large
    'xl': False,      # gpt2-xl
}
# =================================================

MODEL_CONFIGS = {
    'small': {'name': 'gpt2', 'L': 12, 'D': 768, 'H': 12},
    'medium': {'name': 'gpt2-medium', 'L': 24, 'D': 1024, 'H': 16},
    'large': {'name': 'gpt2-large', 'L': 36, 'D': 1280, 'H': 20},
    'xl': {'name': 'gpt2-xl', 'L': 48, 'D': 1600, 'H': 25},
}

V = 50257
T = 1024
B = 1

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\nUsing device: {device}")
if device.type == 'cuda':
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"Total GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
print("\n" + "=" * 80)

results = []

for model_key, config in MODEL_CONFIGS.items():
    if not RUN_CONFIG.get(model_key):
        continue

    print(f"\nValidating {model_key.upper()}...")

    try:
        # Load model
        model = GPT2LMHeadModel.from_pretrained(config['name'])
        model.gradient_checkpointing_disable()
        model = model.to(device)

        # Prepare input
        input_ids = torch.randint(0, V, (B, T)).to(device)
        labels = input_ids.clone()

        # Reset stats
        torch.cuda.reset_peak_memory_stats()
        torch.cuda.empty_cache()

        # Forward + backward
        outputs = model(input_ids, labels=labels)
        outputs.loss.backward()

        # Peak memory
        peak_memory = torch.cuda.max_memory_allocated() / 1e9

        # Formula prediction (FP32 only)
        L, D, H = config['L'], config['D'], config['H']
        P = 12 * L * D * D + V * D
        A = L * (16 * B * T * D + 2 * B * H * T * T) + 2 * B * T * V
        # TODO: 9
        pred = (16 * P + 4 * A) / 1e9

        results.append({
            'model': model_key.upper(),
            'params': f"{P/1e6:.1f}M",
            'actual': peak_memory,
            'pred': pred,
            'error': f"{abs(peak_memory - pred)/pred*100:.1f}%"
        })

        del model
        torch.cuda.empty_cache()

    except Exception as e:
        print(f"  Error: {e}")

print("\n" + "=" * 60)
print("Validation Results (FP32)")
print("=" * 60)
print(f"{'Model':<8} {'Params':<8} {'Actual(GB)':<10} {'Pred(GB)':<10} {'Error':<6}")
print("-" * 60)

for r in results:
    print(f"{r['model']:<8} {r['params']:<8} {r['actual']:<10.2f} {r['pred']:<10.2f} {r['error']:<6}")

print("=" * 60)
```
