---
summary: "OpenClaw 概览、特性与用途"
read_when:
  - 向新用户介绍 OpenClaw
title: "OpenClaw"
---

# OpenClaw 🦞

> _"EXFOLIATE! EXFOLIATE!"_ — 某只太空龙虾，大概

<p align="center">
    <img
        src="/assets/openclaw-logo-text-dark.png"
        alt="OpenClaw"
        width="500"
        class="dark:hidden"
    />
    <img
        src="/assets/openclaw-logo-text.png"
        alt="OpenClaw"
        width="500"
        class="hidden dark:block"
    />
</p>

<p align="center">
  <strong>全平台 + WhatsApp/Telegram/Discord/iMessage 的 AI 代理（Pi）网关。</strong><br />
  通过插件支持 Mattermost 等更多平台。<br />
  发一条消息，即可获得代理回复 —— 触手可及。
</p>

<p align="center">
  <a href="https://github.com/openclaw/openclaw">GitHub</a> ·
  <a href="https://github.com/openclaw/openclaw/releases">Releases</a> ·
  <a href="/">文档</a> ·
  <a href="/start/openclaw">OpenClaw 助手配置</a>
</p>

OpenClaw 将 WhatsApp（WhatsApp Web / Baileys）、Telegram（Bot API / grammY）、Discord（Bot API / channels.discord.js）和 iMessage（imsg CLI）与 [Pi](https://github.com/badlogic/pi-mono) 等编程代理连接起来。插件可增加 Mattermost（Bot API + WebSocket）等支持。OpenClaw 也驱动着 OpenClaw 助手。

## 从这里开始

- **从零安装：** [入门指南](/start/getting-started)
- **引导式配置（推荐）：** [向导](/start/wizard)（`openclaw onboard`）
- **打开控制台（本地网关）：** http://127.0.0.1:18789/（或 http://localhost:18789/）

若网关与浏览器在同一台电脑上运行，上述链接会直接打开浏览器控制界面。若无法打开，请先启动网关：`openclaw gateway`。

## 控制台（浏览器控制界面）

控制台是用于聊天、配置、节点、会话等的浏览器控制界面。  
本地默认：http://127.0.0.1:18789/  
远程访问：[Web 界面](/web) 与 [Tailscale](/gateway/tailscale)

<p align="center">
  <img src="whatsapp-openclaw.jpg" alt="OpenClaw" width="420" />
</p>

## 工作原理

```
WhatsApp / Telegram / Discord / iMessage（+ 插件）
        │
        ▼
  ┌───────────────────────────┐
  │          Gateway          │  ws://127.0.0.1:18789（仅回环）
  │     （单一来源）           │
  │                           │  http://<网关主机>:18793
  │                           │    /__openclaw__/canvas/（Canvas 主机）
  └───────────┬───────────────┘
              │
              ├─ Pi 代理（RPC）
              ├─ CLI（openclaw …）
              ├─ Chat UI（SwiftUI）
              ├─ macOS 应用（OpenClaw.app）
              ├─ iOS 节点（经网关 WS + 配对）
              └─ Android 节点（经网关 WS + 配对）
```

绝大多数操作都经过 **Gateway**（`openclaw gateway`）—— 一个长期运行的进程，负责通道连接与 WebSocket 控制面。

## 网络模型

- **每台主机一个网关（推荐）**：只有该进程可以持有 WhatsApp Web 会话。如需救援机器人或严格隔离，可使用独立配置与端口运行多网关；参见 [多网关](/gateway/multiple-gateways)。
- **优先回环**：网关 WebSocket 默认 `ws://127.0.0.1:18789`。
  - 向导现在默认会生成网关令牌（即使仅回环）。
  - 若需 Tailnet 访问，请运行 `openclaw gateway --bind tailnet --token ...`（非回环绑定必须提供 token）。
- **节点**：通过 WebSocket 连接网关（可按需使用 LAN/tailnet/SSH）；旧版 TCP 桥接已弃用/移除。
- **Canvas 主机**：在 `canvasHost.port`（默认 `18793`）上提供 HTTP 文件服务，为节点 WebView 提供 `/__openclaw__/canvas/`；参见 [网关配置](/gateway/configuration)（`canvasHost`）。
- **远程使用**：SSH 隧道或 tailnet/VPN；参见 [远程访问](/gateway/remote) 与 [发现](/gateway/discovery)。

## 功能概览

- 📱 **WhatsApp 集成** — 使用 Baileys 实现 WhatsApp Web 协议
- ✈️ **Telegram 机器人** — 通过 grammY 支持私信与群组
- 🎮 **Discord 机器人** — 通过 channels.discord.js 支持私信与服务器频道
- 🧩 **Mattermost 机器人（插件）** — Bot 令牌 + WebSocket 事件
- 💬 **iMessage** — 本地 imsg CLI 集成（macOS）
- 🤖 **代理桥接** — Pi（RPC 模式）与工具流式输出
- ⏱️ **流式与分片** — 块流式 + Telegram 草稿流式详情（[流式](/concepts/streaming)）
- 🧠 **多代理路由** — 将提供商账号/对端路由到独立代理（工作区 + 每代理会话）
- 🔐 **订阅鉴权** — Anthropic（Claude Pro/Max）+ OpenAI（ChatGPT/Codex）通过 OAuth
- 💬 **会话** — 单聊合并为共享 `main`（默认）；群组独立
- 👥 **群聊支持** — 默认需 @ 提及；所有者可用 `/activation always|mention` 切换
- 📎 **媒体支持** — 收发图片、音频、文档
- 🎤 **语音消息** — 可选转写钩子
- 🖥️ **WebChat + macOS 应用** — 本地 UI + 菜单栏伴侣（运维与语音唤醒）
- 📱 **iOS 节点** — 作为节点配对，提供 Canvas 界面
- 📱 **Android 节点** — 作为节点配对，提供 Canvas + 聊天 + 相机

说明：旧版 Claude/Codex/Gemini/Opencode 路径已移除；Pi 为当前唯一的编程代理路径。

## 快速开始

运行环境要求：**Node ≥ 22**。

```bash
# 推荐：全局安装（npm/pnpm）
npm install -g openclaw@latest
# 或：pnpm add -g openclaw@latest

# 引导配置 + 安装服务（launchd/systemd 用户服务）
openclaw onboard --install-daemon

# 配对 WhatsApp Web（显示二维码）
openclaw channels login

# 引导完成后网关由服务运行；也可手动运行：
openclaw gateway --port 18789
```

之后在 npm 与 git 安装之间切换很容易：安装另一种方式后执行 `openclaw doctor` 即可更新网关服务入口。

从源码运行（开发）：

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build # 首次运行会自动安装 UI 依赖
pnpm build
openclaw onboard --install-daemon
```

若尚未全局安装，可在仓库目录下用 `pnpm openclaw ...` 执行引导步骤。

多实例快速开始（可选）：

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/a.json \
OPENCLAW_STATE_DIR=~/.openclaw-a \
openclaw gateway --port 19001
```

发送测试消息（需网关已运行）：

```bash
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

## 配置（可选）

配置文件位置：`~/.openclaw/openclaw.json`。

- **若不做任何配置**，OpenClaw 将使用内置的 Pi 二进制、RPC 模式，并按发送方维护会话。
- **若需限制访问**，可从 `channels.whatsapp.allowFrom` 及（群组）提及规则入手。

示例：

```json5
{
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } },
    },
  },
  messages: { groupChat: { mentionPatterns: ["@openclaw"] } },
}
```

## 文档导航

- 入门：[文档中心](/start/hubs)、[帮助](/help)、[配置](/gateway/configuration)、[斜杠命令](/tools/slash-commands)、[多代理路由](/concepts/multi-agent)、[更新/回滚](/install/updating)、[配对](/start/pairing)、[Nix 模式](/install/nix)、[OpenClaw 助手配置](/start/openclaw)、[技能](/tools/skills)、[网关运维](/gateway)、[节点](/nodes)、[远程访问](/gateway/remote) 等。
- 提供商与体验：[WebChat](/web/webchat)、[控制台](/web/control-ui)、[Telegram](/channels/telegram)、[Discord](/channels/discord)、[群组](/concepts/groups)、[媒体](/nodes/images) 等。
- 配套应用：[macOS](/platforms/macos)、[iOS](/platforms/ios)、[Android](/platforms/android)、[Windows (WSL2)](/platforms/windows)、[Linux](/platforms/linux)。
- 运维与安全：[会话](/concepts/session)、[Cron 任务](/automation/cron-jobs)、[Webhooks](/automation/webhook)、[安全](/gateway/security)、[故障排除](/gateway/troubleshooting)。

## 名字由来

**OpenClaw = CLAW + TARDIS** — 因为每只太空龙虾都需要一台时空机器。

---

_"我们不过是在玩自己的 prompt。"_ — 某 AI，大概是 token 上头了

## 致谢

- **Peter Steinberger** ([@steipete](https://x.com/steipete)) — 创作者，龙虾传语者
- **Mario Zechner** ([@badlogicc](https://x.com/badlogicgames)) — Pi 创作者，安全渗透测试
- **Clawd** — 那只坚持要有个更好名字的太空龙虾

## 核心贡献者

- **Maxim Vovshin** (@Hyaxia) — Blogwatcher 技能
- **Nacho Iacovino** (@nachoiacovino) — 位置解析（Telegram + WhatsApp）

## 许可证

MIT — 自由如海里的龙虾 🦞

---

_"我们不过是在玩自己的 prompt。"_ — 某 AI，大概是 token 上头了
