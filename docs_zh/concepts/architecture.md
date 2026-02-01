---
summary: "WebSocket 网关架构、组件与客户端流程"
read_when:
  - 开发网关协议、客户端或传输
title: "网关架构"
---

# 网关架构

最后更新：2026-01-22

## 概览

- 单一长期运行的 **Gateway** 持有所有消息界面（WhatsApp 经 Baileys、Telegram 经 grammY、Slack、Discord、Signal、iMessage、WebChat）。
- 控制面客户端（macOS 应用、CLI、Web 管理界面、自动化）通过 **WebSocket** 在配置的绑定主机（默认 `127.0.0.1:18789`）上连接网关。
- **节点**（macOS/iOS/Android/无头）也通过 **WebSocket** 连接，但需声明 `role: node` 及明确的 caps/commands。
- 每台主机一个网关；它是唯一打开 WhatsApp 会话的进程。
- **Canvas 主机**（默认 `18793`）提供代理可编辑的 HTML 与 A2UI。

## 组件与流程

### Gateway（守护进程）

- 维护各提供商连接。
- 暴露类型化 WS API（请求、响应、服务端推送事件）。
- 按 JSON Schema 校验入站帧。
- 发出 `agent`、`chat`、`presence`、`health`、`heartbeat`、`cron` 等事件。

### 客户端（Mac 应用 / CLI / Web 管理）

- 每个客户端一个 WS 连接。
- 发送请求（`health`、`status`、`send`、`agent`、`system-presence`）。
- 订阅事件（`tick`、`agent`、`presence`、`shutdown`）。

### 节点（macOS / iOS / Android / 无头）

- 通过 `role: node` 连接 **同一 WS 服务**。
- 在 `connect` 中提供设备身份；配对以 **设备** 为单位（角色 `node`），审批保存在设备配对存储中。
- 暴露 `canvas.*`、`camera.*`、`screen.record`、`location.get` 等命令。

协议细节：[网关协议](/gateway/protocol)

### WebChat

- 使用网关 WS API 获取聊天记录并发送消息的静态界面。
- 在远程部署中，通过与其他客户端相同的 SSH/Tailscale 隧道连接。

## 连接生命周期（单客户端）

```
Client                    Gateway
  |                          |
  |---- req:connect -------->|
  |<------ res (ok) ---------|   （或 res error + close）
  |   (payload=hello-ok 携带快照：presence + health)
  |                          |
  |<------ event:presence ---|
  |<------ event:tick -------|
  |                          |
  |------- req:agent ------->|
  |<------ res:agent --------|   (ack: {runId,status:"accepted"})
  |<------ event:agent ------|   (流式)
  |<------ res:agent --------|   (最终: {runId,status,summary})
  |                          |
```

## 线缆协议（摘要）

- 传输：WebSocket，文本帧，JSON 负载。
- 首帧 **必须** 为 `connect`。
- 握手之后：
  - 请求：`{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
  - 事件：`{type:"event", event, payload, seq?, stateVersion?}`
- 若设置了 `OPENCLAW_GATEWAY_TOKEN`（或 `--token`），`connect.params.auth.token` 必须匹配，否则关闭连接。
- 具有副作用的方法（`send`、`agent`）需要幂等键以便安全重试；服务端维护短期去重缓存。
- 节点必须在 `connect` 中包含 `role: "node"` 以及 caps/commands/permissions。

## 配对与本地信任

- 所有 WS 客户端（操作员 + 节点）在 `connect` 时提供 **设备身份**。
- 新设备 ID 需经配对审批；网关为后续连接签发 **设备令牌**。
- **本地** 连接（回环或网关主机自身的 tailnet 地址）可自动批准以保持同机体验。
- **非本地** 连接必须对 `connect.challenge` nonce 签名并需显式批准。
- 网关鉴权（`gateway.auth.*`）仍适用于 **所有** 连接，本地或远程。

详情：[网关协议](/gateway/protocol)、[配对](/start/pairing)、[安全](/gateway/security)。
