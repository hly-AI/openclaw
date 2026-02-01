---
summary: "故障排除中心：现象 → 检查项 → 修复"
read_when:
  - 遇到报错并想按修复路径排查
  - 安装显示「成功」但 CLI 不可用
title: "故障排除"
---

# 故障排除

## 前 60 秒

按顺序执行：

```bash
openclaw status
openclaw status --all
openclaw gateway probe
openclaw logs --follow
openclaw doctor
```

若网关可达，进行深度探测：

```bash
openclaw status --deep
```

## 常见「坏了」情况

### `openclaw: command not found`

几乎都是 Node/npm 的 PATH 问题。请先看：

- [安装（Node/npm PATH 自检）](/install#nodejs--npm-path-sanity)

### 安装失败（或需要完整日志）

以详细模式重新运行安装脚本，查看完整跟踪与 npm 输出：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --verbose
```

Beta 安装：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --beta --verbose
```

也可设置 `OPENCLAW_VERBOSE=1` 代替上述参数。

### 网关「未授权」、无法连接或不断重连

- [网关故障排除](/gateway/troubleshooting)
- [网关鉴权](/gateway/authentication)

### 控制界面在 HTTP 下失败（需要设备身份）

- [网关故障排除](/gateway/troubleshooting)
- [控制界面](/web/control-ui#insecure-http)

### `docs.openclaw.ai` 出现 SSL 错误（Comcast/Xfinity）

部分 Comcast/Xfinity 连接会通过 Xfinity Advanced Security 拦截 `docs.openclaw.ai`。  
关闭 Advanced Security 或将 `docs.openclaw.ai` 加入白名单后重试。

- Xfinity Advanced Security 帮助：https://www.xfinity.com/support/articles/using-xfinity-xfi-advanced-security
- 快速自检：用手机热点或 VPN 确认是否为运营商级过滤

### 服务显示在运行，但 RPC 探测失败

- [网关故障排除](/gateway/troubleshooting)
- [后台进程 / 服务](/gateway/background-process)

### 模型/鉴权失败（限流、计费、「所有模型失败」）

- [模型](/cli/models)
- [OAuth / 鉴权概念](/concepts/oauth)

### `/model` 显示 `model not allowed`

通常表示 `agents.defaults.models` 被配置为允许列表。当该列表非空时，只能选择其中的 provider/model 键。

- 查看允许列表：`openclaw config get agents.defaults.models`
- 添加所需模型（或清空允许列表）后重试 `/model`
- 使用 `/models` 浏览允许的提供商/模型

### 提交 Issue 时

请粘贴一份安全报告：

```bash
openclaw status --all
```

如有可能，附上 `openclaw logs --follow` 的相关日志尾部。
