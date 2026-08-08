---
title: 用einops包替换掉PyTorch的大部分矩阵变换函数
date: 2026-02-09 10:11:31
tags:
- 工具
published: true
hideInList: false
feature: null
isTop: false
---

只是 `rearrange` ，`reduce` ， `repeat` 和 `einsum` 这四个函数而已。
但真的很好用。

<!-- more -->

爱因斯坦求和标记：[Einops tutorial, part 1: basics - Einops](https://einops.rocks/1-einops-basics/)

> edit time: 2026-02-09 22:36:31
## rearrange, reduce, repeat

`rearrange` 函数：以更可读的方式重排、合并或拆分维度。
在这种计算机视觉的上下文里还挺合适的，分别是batch channel height width这样的实际语义，做调整时保持语义会很有利于阅读。
```python
# y = x.transpose(0, 2, 3, 1)
y = rearrange(x, 'b c h w -> b h w c')
```

`reduce` 函数：这个真的很好读，一看就是对channel维度做了mean操作。
```python
# x.mean(-1)
reduce(x, 'b h w c -> b h w', 'mean')
```

`repeat` 函数：同理，一看就是在中间这个地方重复了5次。
```python
repeat(ims[0], "h w c -> h 5 w c").shape
```
## einsum

(1)那么接下来可以把 `einsum` 用于矩阵乘法。
```
Y = D @ A.T # basic implementation
Y = einsum(D, A, "... d_in, d_out d_in -> ... d_out")
# better in reading
```

(2)当然也可以用于广播操作。
We have a batch of images, and for each image we want to generate 10 dimmed versions based on some scaling factor:
```python
images = torch.randn(64, 128, 128, 3) # (batch, height, width, channel)
dim_by = torch.linspace(start=0.0, end=1.0, steps=10)
## Reshape and multiply
dim_value = rearrange(dim_by, "dim_value -> 1 dim_value 1 1 1")
images_rearr = rearrange(images, "b height width channel -> b 1 height width channel")
dimmed_images = images_rearr * dim_value

## Or:
dimmed_images = einsum(
	images, dim_by,
	"b h w c, dim_value -> b dim_value h w c"
)
```

(3) 假如需要对一批图片的中间两个维度施加一个线性变换（channel独立）。
注意：**需要独立的维度一般放在前面。**
```python
channels_last = torch.randn(64, 32, 32, 3) # (batch, height, width, channel)
B = torch.randn(32*32, 32*32)

channels_first = rearrange(
	channels_last,
	"b h w c -> b c (h w)"
)
channels_first_transformed = einsum(
	channels_first, B,
	"b c pixel_in, pixel_out pixel_in -> b c pixel_out"
)
channels_last_transformed = rearrange(
	channels_first_transformed,
	"b c (h w) -> b h w c"
)
```

没有了。以上就是基础用法。去实践吧。这个包真的意料之外地好用。
