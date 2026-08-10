---
title: 抓到一个会“假装训练”的 bug：TRL 1.9.2 续训 LoRA 时优化器是空的
date: 2026-08-10 18:30:00
tags:
- 大模型
published: true
hideInList: false
feature: null
isTop: false
---

先说结论：**TRL 1.9.2 的 `GRPOTrainer` 在“从已有 LoRA adapter 续训”这条路上，存在一个会静默空转的 bug**。训练跑完、日志好看、loss 在降、reward 在涨、grad_norm 非零——但保存下来的权重和你喂进去的初始权重逐字节相同。模型根本没训。

这不是我们写错了什么玄学配置，而是框架在某种官方支持的使用方式下，自己把优化器建成了空的。下面把它讲清楚：什么情况会踩、怎么最小复现、根因在哪、怎么修、怎么自检。

## 什么情况下会踩

同时满足下面三个条件就会踩：

1. 你先用 `PeftModel.from_pretrained(base, adapter)` 加载了一个已有的 LoRA adapter（注意这里**默认** `is_trainable=False`）；
2. 把它直接交给 `GRPOTrainer`，且 **`beta != 0`**（也就是要用 KL 约束参考策略）；
3. 没有额外传 `peft_config`（因为模型已经是 PeftModel 了）。

这不算是冷门用法：SFT 预热完再上 GRPO，是 Agentic RL 最常见的流程之一。我们用 Qwen3-0.6B 在双卡 5090 上跑了一整轮实验（100 步、带过程奖励、跑满、wandb 曲线齐全），结果权重哈希一对比，和 SFT 初始化一模一样——白跑。

## 最小复现

我在 Kaggle 上放了一个公开的复现 notebook（CPU 就能跑，两三分钟）：

[TRL 1.9.2 ref adapter silent no-op repro](https://www.kaggle.com/code/meredith10pi/trl-1-9-2-ref-adapter-silent-no-op-repro)

核心代码就这几行：

```python
model = PeftModel.from_pretrained(base, sft_adapter)   # is_trainable=False
trainer = GRPOTrainer(
    model=model,
    args=GRPOConfig(beta=0.01, ...),   # beta != 0 触发 bug 路径
    reward_funcs=[reward_fn],
    train_dataset=train,
)
trainer.train()
```

跑完看三件事：

```text
trainable params right after trainer init: 0        # ← 已经不对劲
optimizer param count (captured at creation): 0     # ← 实锤：优化器是空的
last log line: {'loss': -0.26, 'grad_norm': 0.001, 'reward': 0.625}   # ← 但指标活着
saved == initial: True                              # ← 什么都没训
```

对照组就改一个参数——加载时传 `is_trainable=True`：

```text
optimizer param count (captured at creation): 12
saved == initial: False
```

同样的脚本、同样的数据、同样的奖励，只有 `inference_mode` 不同，结果从“白跑”变成“真训”。这基本锁死了根因。

## 根因（三步）

1. `PeftModel.from_pretrained(..., is_trainable=False)` 会在 adapter 配置里写 `inference_mode=True`。
2. `beta != 0` 时，TRL 为了算 KL 项，会自动创建一个叫 `ref` 的 adapter 作为参考策略，并且**直接把 default adapter 的配置原样传过去**（`model.add_adapter("ref", default_config)`）。PEFT 的 `inject_adapter` 收尾时，只要配置是 inference 模式，就会把**当前激活的 adapter（default）一起冻结**。
3. 于是 `GRPOTrainer` 初始化完，模型里一个可训练参数都没有，优化器创建出来是空的。

那为什么日志还那么热闹？因为训练循环里算参考 logps 时会临时切换 adapter（`use_adapter` 里调用 `set_adapter`），把 `requires_grad` 翻来翻去：梯度照常累积、`grad_norm` 照常打印、loss 随每步采样的不同题目自然波动。**只有 `optimizer.step()` 无事可做。** 看起来在训练，其实只是在看风景。

## 怎么修

两个办法，都能让训练真正发生：

**最快的修法**：加载时传 `is_trainable=True`。

```python
model = PeftModel.from_pretrained(base, sft_adapter, is_trainable=True)
```

**更稳的修法**：把预热权重合进基座，再新建一个干净的 LoRA（参考策略语义上也更正确——它就是一个真正的 SFT 模型）。

```python
warm = PeftModel.from_pretrained(base, sft_adapter)
model = warm.merge_and_unload()
trainer = GRPOTrainer(model=model, peft_config=LoraConfig(...), ...)
```

我们在自己的项目里用的是第二种，并把它固化成了训练脚本里的哈希校验（每次训练结束打印保存权重和初始权重的 md5，一致就报警）。

## `is_trainable=True` 能解决什么、不能解决什么

上面两个修法都验证有效，但它们的“能”和“不能”不一样，值得单独说清楚——免得有人以为传个参数就万事大吉。

**`is_trainable=True` 能直接解决的：**

- 让加载的 adapter 变成可训练，优化器非空，GRPO 真正更新权重——也就是“续训白跑”这个核心症状，一行解决；
- 原理上它把 PEFT 的 `inference_mode` 变成 `False`，正好绕开 `add_adapter` 把 default 冻结的那一步。

**`is_trainable=True` 解决不了的：**

- **它不会给你任何警告。** 它只是让“你这一次”没踩坑；框架不会告诉你“你差点踩坑”。同一个仓库里其他人（或者未来的你）用默认的 `is_trainable=False`，还是会静默白跑。这正是要提 issue 的原因：治本要靠框架 fail fast，不能指望每个用户恰好知道这个参数。
- **它不能换 LoRA 结构。** RL 阶段想改 `r`、`target_modules` 或换新的 `peft_config`？TRL 1.9.2 对“PeftModel + peft_config”的组合直接报错，`is_trainable=True` 改不了 adapter 结构——这种场景只能 `merge_and_unload()` 之后重新建 LoRA。
- **它没消除 ref adapter 这个脆弱点。** `is_trainable=True` 时 TRL 仍然会创建一个 `ref` 副本（实测它是冻结的、语义没问题），但“ref 应该冻结”这件事靠的是当前 PEFT 行为，而不是 TRL 自己的保证；框架修好之前，这个机制随时可能再咬人。
- **它对默认用法仍然是陷阱。** 框架的默认行为（`is_trainable=False` + `beta != 0` → 空优化器）不改，文档里也不会写，被咬只是时间问题。

所以结论是：`is_trainable=True` 是**最快的逃生舱**，`merge_and_unload` 是**官方推荐且更可控的路径**，但两者都只是绕路——真正该修的是框架本身。

## 对 TRL 的建议

这个 bug 最危险的地方不是“没训”，而是**没有任何报错**。所以框架侧至少应该做两件事：

1. `GRPOTrainer` 初始化时检查策略 adapter 有没有可训练参数，没有就直接抛错（提示 `is_trainable=True` 或传 `peft_config`）；
2. 创建 `ref` adapter 时显式冻结它，不要让它把 default 一起拖下水。

我已经把完整的证据链、根因分析、以及按 TRL 仓库模板写好的 issue / PR 草稿整理在了我们的实验仓库里，等人工确认后再提交。相关 issue 里有一个很像的 [\#3031](https://github.com/huggingface/trl/issues/3031)，但症状不一样：那边是“奖励完全不涨、梯度为 0”，一眼就能看出有问题；这边是**所有指标都在动**，只有对比权重哈希才能发现——比那个隐蔽得多。

## 怎么自检自己有没有踩过

如果你做过“SFT 预热 → GRPO 续训”，而且当时用的是 `PeftModel.from_pretrained` 直接加载，花十秒钟自查一下：

- 训练日志里打印一下 `optimizer.param_groups` 里的参数个数，是 0 就中招了；
- 或者更直接：把训练后的 adapter 和初始 adapter 各算一个 md5，一样就是没训；
- 再不济，对比一下训练前后在验证集上的表现，完全没变化也要怀疑。

这个 bug 教会我的还是那件事：**RL 是“稀疏”的，日志会骗人，只有可观测性不会。** 训练脚本里那一行哈希校验，是我们这个项目里最值钱的一行代码。

完整的技术档案（源码级根因、替代解释排除、Kaggle 复现结果）：[TRL_REF_ADAPTER_BUG.md](https://github.com/Meredith2328/MathQwen/blob/main/docs/TRL_REF_ADAPTER_BUG.md)
