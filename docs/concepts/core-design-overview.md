---
summary: "OpenClaw 项目结构与核心概要设计"
read_when:
  - 需要了解整体架构与模块职责
title: "Core Design Overview"
---

# OpenClaw 核心概要设计

本文档描述 OpenClaw 仓库的项目结构与核心模块的概要设计，供新成员或跨模块开发参考。

## 1. 项目结构总览

```
openclaw/
├── openclaw.mjs          # CLI 入口（Node 启动器）
├── src/                   # 主源码（TypeScript ESM）
│   ├── entry.ts           # 实际入口：环境/argv 处理后加载 run-main
│   ├── cli/               # CLI 编排、子命令注册、路由
│   ├── commands/          # 业务命令实现（agent、channels、health 等）
│   ├── gateway/           # 网关服务（WS/HTTP、协议、节点管理）
│   ├── agents/            # 代理运行时（Pi 嵌入式、工具、沙箱、会话）
│   ├── channels/          # 通道抽象、插件目录、入站/出站适配
│   ├── config/            # 配置加载、合并、校验、会话存储
│   ├── infra/             # 基础设施（出站投递、心跳、端口、发现、迁移）
│   ├── routing/           # 会话路由（bindings、sessionKey、resolve-route）
│   ├── auto-reply/        # 自动回复流水线（队列、分片、分发、TTS）
│   ├── plugins/           # 插件注册表、CLI/HTTP/Channel/Hook 注册
│   ├── plugin-sdk/       # 插件 SDK 导出（供 extensions 使用）
│   ├── discord|slack|telegram|signal|imessage|web|line/  # 内置通道实现
│   ├── providers/         # 第三方鉴权（GitHub Copilot、Qwen 等）
│   ├── memory/            # 记忆/检索（embedding、批处理、会话文件）
│   ├── media/             # 媒体管道（解析、存储、重定向、服务）
│   ├── media-understanding/ # 多模态理解
│   ├── hooks/             # 钩子框架与内置钩子
│   ├── cron/              # 定时任务
│   ├── daemon/            # 守护进程/安装/探测
│   ├── wizard/            # 引导/配对流程
│   └── ...                # tui、browser、tts、security、sessions 等
├── extensions/            # 通道/能力插件（workspace 包）
├── apps/                  # macOS / iOS / Android 原生应用
├── ui/                    # Web 控制台等前端
├── docs/                  # Mintlify 文档源
├── scripts/               # 构建、发布、工具脚本
├── skills/                # 技能文档与脚本
└── packages/              # 内部包（如 shared）
```

## 2. 核心模块概要设计

### 2.1 入口与 CLI（entry → run-main → program）

- **entry.ts**：设置进程标题、抑制 ExperimentalWarning、Windows argv 规范化；可选 `--profile` 与 respawn；最终 `import("./cli/run-main.js")` 执行 `runCli(process.argv)`。
- **run-main.ts**：加载 dotenv、规范化环境、断言 Node 版本；先 `tryRouteCli`（快速路径）；再 `enableConsoleCapture`、`buildProgram()`、注册 unhandled 处理；按主命令懒加载子 CLI、注册插件命令后 `program.parseAsync(argv)`。
- **program**：Commander 程序构建、子命令注册（agent、channels、gateway、config、cron、nodes 等）、帮助与前置动作（如 config-guard）。

**设计要点**：单一 CLI 入口、按需加载子命令与插件、环境与错误在入口统一处理。

### 2.2 网关（gateway）

- **职责**：单机单实例长期运行，持有所有消息通道连接；对外提供 WebSocket + HTTP API；连接控制端（Mac 应用、CLI、Web 控制台）与节点（Node 角色设备）。
- **server.impl.ts**：`startGatewayServer(port, opts)` 组装并启动网关：加载配置、迁移、插件、通道目录；创建 NodeRegistry、ChannelManager、会话解析、Agent 事件处理；启动 HTTP/WS、Control UI、可选 Canvas、Tailscale、发现、Cron、心跳、重载等。
- **协议**：首帧必须 `connect`；之后请求/响应 `req`/`res`，服务端推送 `event`（agent、chat、presence、health、heartbeat、cron 等）。详见 `gateway/protocol` 与 [Gateway protocol](/gateway/protocol)。
- **server-methods**：各类 RPC 方法实现（agent、channels、send、sessions、config、nodes、health、cron、tts 等），由 `server-methods-list` 与 `coreGatewayHandlers` 统一注册。

**设计要点**：一机一网关、WS 为控制与事件主通道、节点通过 `role: node` 与 caps 声明能力。

### 2.3 通道（channels）与插件（plugins）

- **channels**：抽象“通道”为可插拔实现；`channels/plugins` 提供目录（catalog）、配置写入、入站规范化、出站适配、配对/引导、状态问题等；核心与各通道通过 `ChannelPlugin`、`ChannelOutboundAdapter` 等类型对接。
- **plugins/registry**：统一插件注册表；支持 Channel、CLI 命令、HTTP、Hook、Provider、Tool 等注册形态；从 `extensions/*` 及配置中加载 `openclaw.plugin.json` 并初始化插件。
- **routing**：`resolve-route` 根据 config 的 bindings（peer/guild/team/account/channel）与默认规则解析出 `agentId`、`sessionKey`、`mainSessionKey` 等，供会话与投递使用；`session-key`、`bindings` 与配置中的会话策略一致。

**设计要点**：通道即插件、核心只依赖抽象与目录；路由与 bindings 决定“谁处理哪类会话”。

### 2.4 自动回复与出站（auto-reply + infra/outbound）

- **auto-reply**：从各通道监听到的消息经规范化后，进入自动回复流水线：去重、命令/允许列表、路由到 agent（`routeReply`）、队列与分片（chunk）、TTS 等；结果通过 `dispatch-from-config` 决定最终投递。
- **infra/outbound**：`deliver` 将规范化后的出站负载按通道调用对应发送实现（WhatsApp、Telegram、Discord、Slack、Signal、iMessage、Matrix、MSTeams 等）；分片策略、媒体上限等由通道插件与配置决定。

**设计要点**：入站 → 路由 → Agent 运行 → 出站分片与投递；外发统一走 outbound，便于限长、重试与审计。

### 2.5 代理与运行时（agents）

- **agents**：提供“代理”执行环境：Pi 嵌入式 runner、工具集（sessions、gateway、message、browser、cron、memory、canvas 等）、沙箱策略、会话上下文与压缩；与 gateway 的 `server-methods/agent` 配合，处理 `agent` 请求与流式事件。
- **模型与鉴权**：model-catalog、model-auth、live-model-filter、providers 等决定可用模型与鉴权；工具策略（tool-policy、bash-tools、exec-approval）约束可执行操作。

**设计要点**：Agent 以会话为单位、工具与沙箱可配置、流式结果通过 gateway 推给客户端。

### 2.6 配置与会话（config + config/sessions）

- **config**：单例配置加载、合并文件与环境、Zod 校验、旧版迁移；类型定义覆盖 gateway、agents、channels、sessions、cron、hooks 等。
- **sessions**：会话存储路径、主会话键、元数据、副本（mirror）与修剪策略；与 routing 的 sessionKey 一致，供 gateway 与 agent 使用。

**设计要点**：配置即单一事实来源；会话键与路由绑定一致，便于多端同步与持久化。

### 2.7 扩展与应用（extensions + apps）

- **extensions**：每个子包为独立 npm 包，实现通道或能力（如 msteams、matrix、zalo、voice-call、nostr）；通过 `openclaw.plugin.json` 声明 Channel/CLI/Hook 等，由核心 plugins 加载。
- **apps**：macOS（SwiftUI）、iOS、Android 原生应用，作为“节点”或控制端连接同一网关；发现（Bonjour/宽区）、配对、协议与 `gateway/protocol` 一致。

**设计要点**：核心不内建所有通道，通过 extensions 扩展；移动端与桌面端共享同一网关协议。

## 3. 数据流与关键路径

- **用户发消息**：通道监听 → 规范化 → 路由解析（bindings + sessionKey）→ 若命中 agent 则入队 → Agent 运行 → 工具/模型调用 → 回复分片 → outbound 按通道发送。
- **控制端操作**：CLI/Web/Mac 应用 → WS `req`（如 send、agent、sessions）→ gateway server-methods → 通道或 agent 执行 → `res` + 可选 `event` 推送。
- **节点**：设备以 `role: node` 连接 → 上报 caps（camera、canvas、location 等）→ gateway 将节点能力暴露给 agent 工具 → 命令通过 WS 下发给节点执行。

## 4. 文档与规范

- 仓库规范与命令：见根目录 **AGENTS.md**。
- 网关与协议：**docs/gateway/**、**docs/concepts/architecture.md**。
- 通道与路由：**docs/concepts/channel-routing.md**。
- 配置与会话：**docs/configuration**、**docs/concepts/sessions.md**。
- 对外文档站：https://docs.openclaw.ai/ （Mintlify，内部链接用根相对路径）。

---

*本文档为概要设计，具体 API 与行为以源码与官方文档为准。*
