---
summary: "配对概览：批准谁可以给你发私信 + 哪些节点可以加入"
read_when:
  - 配置私信访问控制
  - 配对新的 iOS/Android 节点
  - 审视 OpenClaw 安全策略
title: "配对"
---

# 配对

“配对”是 OpenClaw 的显式 **所有者批准** 步骤，用于两处：

1. **私信配对**（谁可以和机器人对话）
2. **节点配对**（哪些设备/节点可以加入网关网络）

安全背景：[安全](/gateway/security)

## 1) 私信配对（入站聊天访问）

当通道配置为 DM 策略 `pairing` 时，未知发送方会收到短码，其消息在 **你批准之前不会处理**。

默认 DM 策略见：[安全](/gateway/security)

配对码：

- 8 个字符，大写，无易混字符（`0O1I`）。
- **1 小时后过期**。机器人仅在新请求创建时发送配对消息（大致每个发送方每小时一次）。
- 默认每通道待处理私信配对请求上限为 **3 个**；超出部分在有一个过期或被批准前会被忽略。

### 批准发送方

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

支持的通道：`telegram`、`whatsapp`、`signal`、`imessage`、`discord`、`slack`。

### 状态存储位置

保存在 `~/.openclaw/credentials/` 下：

- 待处理请求：`<channel>-pairing.json`
- 已批准白名单：`<channel>-allowFrom.json`

请妥善保管（它们控制谁可访问你的助手）。

## 2) 节点设备配对（iOS/Android/macOS/无头节点）

节点以 **设备** 身份、`role: node` 连接网关。网关会创建需要批准的设备配对请求。

### 批准节点设备

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
```

### 状态存储位置

保存在 `~/.openclaw/devices/` 下：

- `pending.json`（短期；待处理请求会过期）
- `paired.json`（已配对设备及令牌）

### 说明

- 旧版 `node.pair.*` API（CLI：`openclaw nodes pending/approve`）使用网关独立的配对存储。WS 节点仍需要设备配对。

## 相关文档

- 安全模型与提示注入：[安全](/gateway/security)
- 安全更新（运行 doctor）：[更新](/install/updating)
- 通道配置：[Telegram](/channels/telegram)、[WhatsApp](/channels/whatsapp)、[Discord](/channels/discord)、[Signal](/channels/signal)
