---
summary: "网关服务运维手册：生命周期与操作"
read_when:
  - 运行或调试网关进程
title: "网关运维手册"
---

# 网关服务运维手册

最后更新：2025-12-09

## 是什么

- 常驻进程，持有唯一的 Baileys/Telegram 连接以及控制/事件面。
- 替代旧版 `gateway` 命令。CLI 入口：`openclaw gateway`。
- 持续运行直至被停止；发生致命错误时非零退出，由监控进程重启。

## 如何运行（本地）

```bash
openclaw gateway --port 18789
# 在标准输出中查看完整调试/跟踪日志：
openclaw gateway --port 18789 --verbose
# 若端口被占用，先终止监听再启动：
openclaw gateway --force
# 开发循环（TS 变更时自动重载）：
pnpm gateway:watch
```

- 配置热重载监听 `~/.openclaw/openclaw.json`（或 `OPENCLAW_CONFIG_PATH`）。
  - 默认模式：`gateway.reload.mode="hybrid"`（安全变更热应用，关键变更时重启）。
  - 热重载在需要时通过 **SIGUSR1** 进行进程内重启。
  - 使用 `gateway.reload.mode="off"` 可关闭。
- 将 WebSocket 控制面绑定到 `127.0.0.1:<port>`（默认 18789）。
- 同一端口同时提供 HTTP（控制界面、钩子、A2UI）。单端口复用。
  - OpenAI Chat Completions（HTTP）：[`/v1/chat/completions`](/gateway/openai-http-api)。
  - OpenResponses（HTTP）：[`/v1/responses`](/gateway/openresponses-http-api)。
  - Tools Invoke（HTTP）：[`/tools/invoke`](/gateway/tools-invoke-http-api)。
- 默认在 `canvasHost.port`（默认 `18793`）上启动 Canvas 文件服务，从 `~/.openclaw/workspace/canvas` 提供 `http://<网关主机>:18793/__openclaw__/canvas/`。使用 `canvasHost.enabled=false` 或 `OPENCLAW_SKIP_CANVAS_HOST=1` 可关闭。
- 日志输出到 stdout；使用 launchd/systemd 保持进程运行并轮转日志。
- 故障排除时可传 `--verbose`，将日志文件中的调试日志（握手、请求/响应、事件）镜像到标准输出。
- `--force` 使用 `lsof` 查找所选端口上的监听进程，发送 SIGTERM，记录所终止进程后启动网关（若缺少 `lsof` 会快速失败）。
- 若在监控进程（launchd/systemd/mac 应用子进程模式）下运行，停止/重启通常会发送 **SIGTERM**；旧版本可能显示为 `pnpm` 的 `ELIFECYCLE` 退出码 **143**（SIGTERM），属于正常关闭而非崩溃。
- **SIGUSR1** 在授权后触发进程内重启（网关工具/配置应用或更新，或启用 `commands.restart` 用于手动重启）。
- 默认需要网关鉴权：设置 `gateway.auth.token`（或 `OPENCLAW_GATEWAY_TOKEN`）或 `gateway.auth.password`。除非使用 Tailscale Serve 身份，否则客户端必须在 `connect.params.auth.token/password` 中提供。
- 向导现在默认会生成令牌，即使仅回环。
- 端口优先级：`--port` > `OPENCLAW_GATEWAY_PORT` > `gateway.port` > 默认 `18789`。

## 远程访问

- 推荐 Tailscale/VPN；否则使用 SSH 隧道：
  ```bash
  ssh -N -L 18789:127.0.0.1:18789 user@host
  ```
- 客户端通过隧道连接 `ws://127.0.0.1:18789`。
- 若已配置令牌，即使通过隧道连接，客户端也必须在 `connect.params.auth.token` 中提供。

## 多网关（同一主机）

通常不需要：一个网关即可服务多个消息通道与代理。仅在需要冗余或严格隔离（例如救援机器人）时使用多网关。

若隔离状态与配置并使用不同端口则支持。完整说明：[多网关](/gateway/multiple-gateways)。

服务名称与配置相关：

- macOS：`bot.molt.<profile>`（旧版 `com.openclaw.*` 可能仍存在）
- Linux：`openclaw-gateway-<profile>.service`
- Windows：`OpenClaw Gateway (<profile>)`

安装元数据写入服务配置：

- `OPENCLAW_SERVICE_MARKER=openclaw`
- `OPENCLAW_SERVICE_KIND=gateway`
- `OPENCLAW_SERVICE_VERSION=<version>`

救援机器人模式：使用独立配置、状态目录、工作区和端口间隔运行第二个网关。完整说明：[救援机器人指南](/gateway/multiple-gateways#rescue-bot-guide)。

### 开发配置（`--dev`）

快速路径：在完全隔离的配置/状态/工作区下运行开发实例，不影响主环境。

```bash
openclaw --dev setup
openclaw --dev gateway --allow-unconfigured
# 然后针对开发实例：
openclaw --dev status
openclaw --dev health
```

默认值（可通过环境变量/参数/配置覆盖）：

- `OPENCLAW_STATE_DIR=~/.openclaw-dev`
- `OPENCLAW_CONFIG_PATH=~/.openclaw-dev/openclaw.json`
- `OPENCLAW_GATEWAY_PORT=19001`（网关 WS + HTTP）
- 浏览器控制服务端口 = `19003`（由 gateway.port+2 推导，仅回环）
- `canvasHost.port=19005`（由 gateway.port+4 推导）
- 在 `--dev` 下运行 `setup`/`onboard` 时，`agents.defaults.workspace` 默认变为 `~/.openclaw/workspace-dev`。

更多内容见英文版 [Gateway Runbook](/gateway)。
