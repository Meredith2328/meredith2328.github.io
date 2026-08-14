---
title: 抓到一个会“假装训练”的 bug：TRL 1.9.2 续训 LoRA 时优化器是空的
date: 2026-08-10 18:30:00
tags:
- 大模型
- bugfix
published: true
hideInList: false
feature: null
isTop: false
---

**TRL 1.9.2 的 `GRPOTrainer` 有一个“静默”的bug，如果先SFT再RL就可能碰到。使得模型可能并没有真的从已有的 LoRA adapter 继续训练，但是看起来仍然一切正常。**

怎么个“静默”法呢？训练能完整跑完，日志看起来一切正常：loss 在降、reward 在涨、grad_norm 非零，wandb 曲线漂漂亮亮。可你把训练前后的权重拿去一对比，发现保存下来的 adapter 和你喂进去的初始 adapter 逐字节相同——模型压根没被训过。

这不是我们配置写错了什么冷门参数，也不是运气不好踩到了某个边角。它是框架在一个挺常规的使用方式下，自己把优化器建成了空的，而且全程不吭一声。下面我把这件事从头到尾讲清楚：什么情况会撞上、怎么用最小的例子复现、根因到底在哪、怎么绕开、以及怎么检查自己有没有中招。

已提交 [Issue #6700 · huggingface/trl](https://github.com/huggingface/trl/issues/6700) 和 [Pull Request #6701 · huggingface/trl](https://github.com/huggingface/trl/pull/6701) ，坐等审核。

## 什么情况下会撞上

需要同时满足三个条件：

1. 你先用 `PeftModel.from_pretrained(base, adapter)` 加载了一个已经训练好的 LoRA adapter。注意这一步**默认**是 `is_trainable=False`，也就是按“只用来推理”的方式加载；
2. 把它直接交给 `GRPOTrainer`，并且 **`beta != 0`**（也就是开了 KL 约束，要和参考策略做对比）；
3. 没有额外传 `peft_config`（因为模型本身已经是 PeftModel 了）。

这算不上什么冷门场景。SFT 预热完再上 GRPO，是 Agentic RL 里最常见的流程之一。[我们用 Qwen3-0.6B 在双卡 5090 上完整跑了一轮](https://meredith2328.github.io/posts/notes/ml/mathqwen-0.6b-agentic-rl.html) ：100 步、带过程奖励、跑满、wandb 曲线齐全，看起来什么都是对的。直到某天备份时顺手对比了一下权重哈希，才发现训练产物和 SFT 初始化一模一样——那一整轮实验等于白跑。

## 最小复现

我在 Kaggle 放了一个公开的复现 notebook，用来最小复现这个问题。CPU 就能跑，两三分钟出结果：

[TRL 1.9.2 ref adapter silent no-op repro](https://www.kaggle.com/code/meredith10pi/trl-1-9-2-ref-adapter-silent-no-op-repro)

核心代码其实就这几行：

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

跑完之后，注意看这几个输出：

```text
trainable params right after trainer init: 0        # ← 已经不对劲了
optimizer param count (captured at creation): 0     # ← 实锤：优化器是空的
last log line: {'loss': -0.26, 'grad_norm': 0.001, 'reward': 0.625}   # ← 但指标活得很好
saved == initial: True                              # ← 什么都没训
```

对照实验只改一个参数——加载时传 `is_trainable=True`：

```text
optimizer param count (captured at creation): 12
saved == initial: False
```

同样的脚本、同样的数据、同样的奖励函数，只是 `inference_mode` 不一样，结果就从“白跑一趟”变成“真的在训”。这个对照基本把根因锁死了。

## 根因（三步）

拆开看其实不复杂：

1. `PeftModel.from_pretrained(..., is_trainable=False)` 会在 adapter 的配置里写上 `inference_mode=True`——意思就是“这个 adapter 只用来推理，不训练”；
2. `beta != 0` 时，TRL 为了算 KL 项，会自动创建一个叫 `ref` 的 adapter 当作参考策略，而且**直接把 default adapter 的配置原样传了过去**（`model.add_adapter("ref", default_config)`）。PEFT 的 `inject_adapter` 在收尾的时候，只要配置是 inference 模式，就会把**当前激活的 adapter（也就是 default）一起冻结**；
3. 于是 `GRPOTrainer` 初始化完，整个模型里找不到一个可训练的参数，优化器创建出来自然是空的。

那为什么日志还那么热闹？因为训练循环里计算参考 logps 的时候会临时切换 adapter（`use_adapter` 里调用了 `set_adapter`），把 `requires_grad` 翻来翻去。于是梯度照常累积、`grad_norm` 照常打印，loss 也会随着每步采样的题目不同而自然波动。**只有 `optimizer.step()` 无事可做。** 看起来在训练，其实只是在看风景。

## 怎么修

两个办法都能让训练真正发生，选一个就行：

**最快的办法**：如果省事想直接用，加载时传 `is_trainable=True`，一行搞定。类似 [#3031](https://github.com/huggingface/trl/issues/3031) 。

```python
model = PeftModel.from_pretrained(base, sft_adapter, is_trainable=True)
```

**更稳的办法**：把预热权重合进基座，再新建一个干净的 LoRA。这样做参考策略的语义也更干净——它就是那个真正的 SFT 模型。

```python
warm = PeftModel.from_pretrained(base, sft_adapter)
model = warm.merge_and_unload()
trainer = GRPOTrainer(model=model, peft_config=LoraConfig(...), ...)
```

我们在自己的项目里用的是第二种，并且把检查固化进了训练脚本：每次训练结束都打印保存权重和初始权重的 md5，一致就直接报警。这个习惯后来救了我们好几次。

## `is_trainable=True` 能解决什么、不能解决什么

两个修法都验证有效，但它们的边界不一样。把话说清楚，免得有人以为传个参数就一劳永逸。

**`is_trainable=True` 能直接解决的：**

- 让加载进来的 adapter 变成可训练，优化器非空，GRPO 真正更新权重——“续训白跑”这个核心症状，一行解决；
- 原理上它把 PEFT 的 `inference_mode` 变成 `False`，恰好绕开 `add_adapter` 冻结 default 的那一步。

**`is_trainable=True` 解决不了的：**

- **它不会给你任何警告。** 它只是让你这一次没踩坑；框架不会告诉你“你差点踩坑”。同一个仓库里其他人、或者几个月后的你自己，用默认的 `is_trainable=False`，还是会一样地静默白跑。这正是要提 issue 的原因：治本要靠框架在初始化的时候 fail fast，不能指望每个用户恰好知道这个参数。
- **它不能换 LoRA 结构。** 如果 RL 阶段想改 `r`、`target_modules`，或者想传一个新的 `peft_config`，TRL 1.9.2 对“PeftModel + peft_config”的组合会直接报错，`is_trainable=True` 改不了 adapter 结构——这种场景只能 `merge_and_unload()` 之后重新建 LoRA。
- **它没有消除 ref adapter 这个脆弱点。** `is_trainable=True` 时 TRL 依然会创建一个 `ref` 副本（我们实测它是冻结的，语义上没有坏），但“ref 应该冻结”这件事目前靠的是 PEFT 的行为，而不是 TRL 自己给的保证。框架修好之前，这个机制随时可能再出问题。
- **默认用法仍然是个坑。** 框架的默认行为（`is_trainable=False` + `beta != 0` → 空优化器）不改，文档里也不会写，迟早还会有人踩上去。

所以我的结论是：`is_trainable=True` 是为了图省事，而 `merge_and_unload` 是官方推荐、也更可控的一条路，但两者本质上都是在绕路——真正该修的是框架本身。

## 对 TRL 的建议：可观测性

这个 bug 最危险的地方不是“没训”，而是**全程没有任何报错**。框架侧至少应该做两件事：

1. `GRPOTrainer` 初始化时检查策略 adapter 有没有可训练参数，没有就直接抛错，把原因讲清楚（提示 `is_trainable=True` 或者传 `peft_config`）；
2. 创建 `ref` adapter 的时候显式把它冻结，别让它把 default 一起拖下水。

完整的证据链、根因分析，我都整理在了实验仓库里，之后会提交一下看看。顺带一提，[#3031](https://github.com/huggingface/trl/issues/3031) 看起来和我们很像，但症状不一样：那边是“奖励完全不涨、梯度为 0”，一眼就能看出有问题；我们这边是**所有指标都在动**，只有对比权重哈希才能发现——比那个隐蔽得多。

## 怎么检查自己有没有中招

如果你做过“SFT 预热 → GRPO 续训”，而且当时用的是 `PeftModel.from_pretrained` 直接加载，花十秒钟自查一下：

- 训练日志里加一行，打印 `optimizer.param_groups` 里的参数个数，是 0 就说明中招了；
- 或者另一种方式：把训练后的 adapter 和初始 adapter 各算一个 md5，一样就是没训；
- 再懒一点：对比训练前后在验证集上的表现，”百分比完全没变化“也要起疑心。

更完整的信息可以参考前述的issue和pr。

这个 bug 教会我的还是那件事：**RL 是“稀疏”的，日志会骗人，只有可观测性不会。** 训练脚本里那一行哈希校验，是我们这个项目里最值钱的一行代码。

~~毕竟真金白银拿去租卡训的模型，结果训了半天实验是废的，这谁绷得住啊~~

相关：[[mathqwen-0.6b-agentic-rl|完整踩坑记录]]
