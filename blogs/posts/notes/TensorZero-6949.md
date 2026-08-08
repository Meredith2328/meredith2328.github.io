---
title: Pull Request 6949
date: 2026-03-14 17:36:13
tags:
- 大模型
published: true
hideInList: true
feature: null
isTop: false
---

[Allow `env::...` for `object_storage.endpoint` by Meredith2328 · Pull Request #6949 · tensorzero/tensorzero](https://github.com/tensorzero/tensorzero/pull/6949)

> 本次pr包括**代码逻辑、测试逻辑和文档撰写**三部分。
> 打掉第一只野怪！金币+1，经验+3。
> edit time: 2026-03-14 20:19:59

感悟：对ai工作流的优化
- codex用于处理**环境配置**等耗时的问题，并且负责整理整体代码结构（慢），
- deepseek用于快速问答、给我讲解我要做什么（快）。
## 代码逻辑

`crates/tensorzero-core/src/config/mod.rs`

这里从原来的 `config` 必须字面写出 `endpoint` 来源，修改为了可以支持传入 `env::SOME_ENV` ，在这里parse出 `endpoint` 来源。
具体而言，有三处：
1. 把config的本地引用改为 `mut` ，这样的话我们可以直接parse改成新值。
2. 在进入后续逻辑之前，首先调用 `resolve_object_storage_endpoint` ，执行我们添加的parse helper函数。
3. 编写 `resolve_object_storage_endpoint` 函数逻辑。

```rust hl:3,7-11,19-43
impl ObjectStoreInfo {
    pub fn new(config: Option<StorageKind>) -> Result<Option<Self>, Error> {
        let Some(mut config) = config else {
            return Ok(None);
        };

        if let StorageKind::S3Compatible { endpoint, .. } = &mut config
            && let Some(endpoint_value) = endpoint.take()
        {
            *endpoint = Some(resolve_object_storage_endpoint(&endpoint_value)?);
        }

        let object_store: Option<Arc<dyn ObjectStore>> = match &config {
            StorageKind::Filesystem { path } => {
                Some(Arc::new(match LocalFileSystem::new_with_prefix(path) {
    format!("{e:?}").contains("BadScheme")
}

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

## 测试逻辑

`crates/tensorzero-core/src/config/tests.rs`

添加了三个单元测试。

```rust hl:6,16-100
use tempfile::NamedTempFile;
use toml::de::DeTable;

use crate::{
    embeddings::EmbeddingProviderConfig,
    inference::types::{Role, storage::StorageKind},
    variant::JsonMode,
};

/// Ensure that the sample valid config can be parsed without panicking
#[tokio::test]
        "Unexpected error message: {err}"
    );
}

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

#[tokio::test]
async fn test_config_object_storage_endpoint_env_var_missing_errors() {
    let config_str = r#"
            [object_storage]
            type = "s3_compatible"
            bucket_name = "tensorzero-fake-bucket"
            region = "us-east-1"
            endpoint = "env::TENSORZERO_TEST_NONEXISTENT_S3_ENDPOINT_VAR"

            [functions]"#;
    let config = toml::from_str(config_str).expect("Failed to parse sample config");

    let err = Box::pin(Config::load_from_toml(ConfigInput::Fresh(config)))
        .await
        .expect_err("Should error when the object storage endpoint env var is missing");
    let err_msg = err.to_string();

    assert!(
        err_msg.contains("TENSORZERO_TEST_NONEXISTENT_S3_ENDPOINT_VAR"),
        "Error should mention the missing env var: {err_msg}"
    );
}

#[tokio::test]
async fn test_config_object_storage_endpoint_dynamic_rejected() {
    let config_str = r#"
            [object_storage]
            type = "s3_compatible"
            bucket_name = "tensorzero-fake-bucket"
            region = "us-east-1"
            endpoint = "dynamic::s3_endpoint"

            [functions]"#;
    let config = toml::from_str(config_str).expect("Failed to parse sample config");

    let err = Box::pin(Config::load_from_toml(ConfigInput::Fresh(config)))
        .await
        .expect_err("Dynamic object storage endpoints should be rejected");
    let err_msg = err.to_string();

    assert!(
        err_msg.contains("Invalid `[object_storage].endpoint`"),
        "Error should point to the invalid object storage endpoint: {err_msg}"
    );
    assert!(
        err_msg.contains("Use `env::ENVIRONMENT_VARIABLE` or a literal endpoint value"),
        "Error should explain the supported endpoint forms: {err_msg}"
    );
}

#[tokio::test]
async fn test_config_blocked_s3_http_endpoint_default() {
    let logs_contain = crate::utils::testing::capture_logs();
```

## 文档撰写

`docs/gateway/configuration-reference.mdx`

添加了一行文档。

```
You can also set it to `env::YOUR_ENVIRONMENT_VARIABLE` to read from the environment variable `YOUR_ENVIRONMENT_VARIABLE` on startup.
```
