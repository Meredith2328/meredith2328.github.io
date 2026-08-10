---
title: 给 tensorzero 提的第一个 PR：object_storage.endpoint 支持环境变量
date: 2026-03-14 17:36:13
tags:
- 大模型
---

> 本次 PR 包括**代码逻辑、测试逻辑和文档撰写**三部分。
> 打掉第一只野怪！金币+1，经验+3。
> edit time: 2026-03-14 20:19:59

tensorzero 是一个做 LLM 推理和优化的框架，配置里的 `[object_storage]` 用来管多模态推理时图片之类文件的存储。原来这个段的 `endpoint` 只能写死一个地址，我提的 PR 让它也能写成 `env::SOME_ENV_VAR`，启动的时候从环境变量里读。这样内网地址、测试和生产的存储端点就不用都摊在配置文件里了。

当时提的 PR 是 tensorzero/tensorzero#6949，链接现在打不开了，不过功能最后合了进去，官方[配置文档](https://www.tensorzero.com/docs/gateway/configuration-reference)里也写明了 `endpoint` 支持 `env::` 这种写法。

## 感悟：对 ai 工作流的优化

- codex 用于处理**环境配置**等耗时的问题，并且负责整理整体代码结构（慢），
- deepseek 用于快速问答、给我讲解我要做什么（快）。

## 代码逻辑

`crates/tensorzero-core/src/config/mod.rs`

改动就三处：

1. `ObjectStoreInfo::new` 里 config 的本地引用改成 `mut`，这样可以直接把 parse 出来的新值写回去；
2. 进入后续逻辑之前先调用 `resolve_object_storage_endpoint`，处理 `S3Compatible` 的 `endpoint`；
3. 新增 `resolve_object_storage_endpoint`：`env::` 开头的从环境变量取值，其余不该出现在这里的写法（`dynamic::`、`path::`、`sdk`、`none`）直接报错，错误信息里说清楚应该怎么写。

```rust
fn resolve_object_storage_endpoint(endpoint: &str) -> Result<String, Error> {
    if let Some(env_var) = endpoint.strip_prefix("env::") {
        return std::env::var(env_var).map_err(|_| {
            Error::new(ErrorDetails::Config {
                message: format!(
                    "Environment variable `{env_var}` not found. Your configuration for `[object_storage]` requires this variable for `endpoint`."
                ),
            })
        });
    }

    if endpoint.starts_with("dynamic::")
        || endpoint.starts_with("path::")
        || endpoint.starts_with("path_from_env::")
        || matches!(endpoint, "sdk" | "none")
    {
        return Err(Error::new(ErrorDetails::Config {
            message: format!(
                "Invalid `[object_storage].endpoint`: `{endpoint}`. Use `env::ENVIRONMENT_VARIABLE` or a literal endpoint value."
            ),
        }));
    }

    Ok(endpoint.to_string())
}
```

调用处大概长这样，`endpoint` 先取出来、解析完再放回去，后续逻辑完全不用改：

```rust
if let StorageKind::S3Compatible { endpoint, .. } = &mut config
    && let Some(endpoint_value) = endpoint.take()
{
    *endpoint = Some(resolve_object_storage_endpoint(&endpoint_value)?);
}
```

## 测试逻辑

`crates/tensorzero-core/src/config/tests.rs`

加了三个单元测试：

1. `env::TENSORZERO_TEST_S3_ENDPOINT` 存在时，`endpoint` 能解析成环境变量里的值；
2. 环境变量不存在时，报错信息里带上变量名，方便排查；
3. `dynamic::` 这类不该出现的写法直接被拒绝，并提示应该用 `env::` 或字面量。

```rust
#[tokio::test]
async fn test_config_object_storage_endpoint_env_var_resolves() {
    tensorzero_unsafe_helpers::set_env_var_tests_only(
        "TENSORZERO_TEST_S3_ENDPOINT",
        "https://storage.example.com",
    );

    let config_str = r#"
            [object_storage]
            type = "s3_compatible"
            bucket_name = "tensorzero-fake-bucket"
            region = "us-east-1"
            endpoint = "env::TENSORZERO_TEST_S3_ENDPOINT"

            [functions]"#;
    let config = toml::from_str(config_str).expect("Failed to parse sample config");

    let config = Box::pin(Config::load_from_toml(ConfigInput::Fresh(config)))
        .await
        .expect("Env-backed object storage endpoint should be valid config");
    let object_store_info = config
        .object_store_info
        .as_ref()
        .expect("Object store info should be initialized");

    let StorageKind::S3Compatible { endpoint, .. } = &object_store_info.kind else {
        panic!("Expected an S3-compatible object store");
    };

    assert_eq!(
        endpoint.as_deref(),
        Some("https://storage.example.com"),
        "The resolved endpoint should be stored in the object store kind"
    );
}
```

（当时调的是 `Config::load_from_toml`，现在上游改成了 `Config::load_unwritten_config`，测的逻辑没变。）

## 文档撰写

`docs/gateway/configuration-reference.mdx`

加了一行说明：

```
You can also set it to `env::YOUR_ENVIRONMENT_VARIABLE` to read from the environment variable `YOUR_ENVIRONMENT_VARIABLE` on startup.
```

