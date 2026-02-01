---
summary: "OpenClaw 入门向导常见问题与故障排除"
title: "入门向导常见问题"
translation: zh
---

# 入门向导常见问题

本文档整理自初次使用 OpenClaw 时的常见疑问与故障排除步骤，涵盖频道选择、WebChat、TUI、技能安装、Node 版本管理以及 CLI 报错处理等。

## 目录

- [微信与 WebChat](#微信与-webchat)
- [频道与技能选择](#频道与技能选择)
- [WebChat 使用](#webchat-使用)
- [TUI 与 Hatch 流程](#tui-与-hatch-流程)
- [TUI 无输出故障排除](#tui-无输出故障排除)
- [CLI agent 报错](#cli-agent-报错)
- [Node 版本管理（fnm）](#node-版本管理fnm)
- [Notion 简介](#notion-简介)

---

## 微信与 WebChat

### 为什么 QuickStart 里没有微信？

OpenClaw 目前**不支持微信（WeChat）**作为频道，主要原因：

- **微信 API 封闭**：个人微信没有官方 Bot API；公众号/企业微信需要企业认证。
- **接入成本高**：微信生态有合规与开发门槛，需要单独适配。
- **平台定位**：OpenClaw 优先支持有开放 Bot API 的平台（如 Telegram、Discord、Slack 等）。

### 文档里的 "WebChat" 是微信吗？

**不是**。两者容易混淆：

| 名称 | 含义 |
|------|------|
| **WebChat** | OpenClaw 内置的**网页聊天界面**，通过 Gateway WebSocket 连接，在浏览器中与助手对话 |
| **WeChat** | **微信**，腾讯的即时通讯应用 |

README 和文档中的 "WebChat" 指的是网页聊天界面，不是微信。

---

## 频道与技能选择

### QuickStart 里「Select channel」选什么？

根据使用场景选择：

| 推荐 | 适用场景 |
|------|----------|
| **Telegram (Bot API)** | 配置简单、跨平台，推荐首选 |
| **Discord (Bot API)** | 已在用 Discord、技术/游戏社区 |
| **WhatsApp (QR link)** | 日常主要用 WhatsApp |
| **Slack** | 工作协作 |
| **iMessage (imsg)** | 主要使用 Apple 设备 |
| **Skip for now** | 首次使用、暂不配置频道，可先用 WebChat 或 CLI |

操作：用**上下箭头**移动，**回车**确认。首次使用建议选 **Skip for now**，后续再用 WebChat 或 CLI 体验。

### 技能依赖（skill dependencies）选什么？

这是**可选的扩展技能**，用于增强助手能力。建议：

- **首次使用**：选择 **"Skip for now"**，先完成 onboarding。
- **按需安装**：之后可用 `openclaw skills install <skill-name>` 单独安装。

常用技能示例：`github`、`clawhub`、`obsidian`、`apple-notes`、`1password` 等，根据实际需求勾选。

操作：**空格**勾选/取消，**回车**确认。

---

## WebChat 使用

### 如何启用 WebChat？

WebChat 是**内置功能**，无需额外配置：

1. 启动 Gateway：`openclaw gateway` 或 `openclaw onboard`（会自动启动）。
2. 在浏览器访问：`http://localhost:18789/`。
3. 开始对话。

### 访问方式

| 方式 | 说明 |
|------|------|
| **浏览器** | `http://localhost:18789/`（Control UI 内含聊天界面） |
| **macOS App** | 菜单栏应用内嵌 WebChat |
| **iOS App** | iOS 应用内置 WebChat |

### 远程访问（可选）

可通过 Tailscale Serve 暴露 Gateway，在 Tailscale 网络中访问 WebChat，详见 [Tailscale 文档](/gateway/tailscale)。

---

## TUI 与 Hatch 流程

### "How do you want to hatch your bot?" 是什么意思？

**Hatch** = 孵化 / 启动，**Bot** = 助手。即：**你想用哪种方式第一次启动并和助手对话**。

| 选项 | 含义 |
|------|------|
| **Hatch in TUI (recommended)** | 在**终端**中直接与助手对话，推荐 |
| **Open the Web UI** | 打开**网页界面**（WebChat）对话 |
| **Do this later** | 暂时跳过，稍后再启动 |

### TUI 弹出后怎么办？

这是 **OpenClaw TUI** 的聊天界面，已连接 Gateway。在底部**输入框**输入消息并**回车**即可发送，例如：

- `你好`
- `今天天气怎么样`
- `帮我写一段 Python 代码`

---

## TUI 无输出故障排除

### "(no output)" 是什么意思？

**"(no output)"** 表示：**助手本轮没有返回任何可显示的文字**。即你的消息已发送，但 TUI 没有收到或显示助手的回复。

### 可能原因

1. **模型/Provider 问题**：如使用 `zai/glm-4.7`，API Key 或网络异常可能导致无回复。
2. **工具调用失败**：助手可能调用了工具（如天气查询），但工具未返回内容。
3. **网络或 Gateway**：请求未到达模型，或回复未传回 TUI。
4. **模型返回空**：极少数情况下模型返回空字符串。

### 详细排查步骤

#### 第一步：确认 Gateway 在运行

```bash
lsof -i :18789
```

有 `LISTEN` 和 `ESTABLISHED` 表示 Gateway 在运行且有客户端连接。

#### 第二步：查看 Gateway 终端输出

在运行 `openclaw gateway` 的终端中，发送消息后观察是否有 `error`、`failed`、`timeout`、`401`、`500` 等报错。

#### 第三步：检查模型与 Provider 配置

```bash
cat ~/.openclaw/openclaw.json
```

确认 `agent.model`、`providers`、API Key 等配置正确。Z.AI 文档：[/providers/zai](/providers/zai)。

#### 第四步：用 CLI 测试（绕过 TUI）

```bash
openclaw agent --message "你好" --agent main
```

- **有回复**：模型和 Gateway 正常，问题可能在 TUI 或会话绑定。
- **无回复**：问题在模型/Provider/API Key。

#### 第五步：换模型验证

若配置了 OpenAI 或 Anthropic，可临时改用其他模型测试：

```bash
openclaw agent --message "你好" --agent main --model openai/gpt-4o-mini
```

#### 第六步：核对清单

| 检查项 | 命令/方法 |
|--------|-----------|
| Gateway 在跑 | `lsof -i :18789` |
| 配置文件存在 | `cat ~/.openclaw/openclaw.json` |
| API Key 已设置 | `echo $ZAI_API_KEY` 或对应环境变量 |
| CLI 有回复 | `openclaw agent --message "你好" --agent main` |
| Gateway 无报错 | 查看 Gateway 终端输出 |

---

## CLI agent 报错

### "Pass --to <E.164>, --session-id, or --agent to choose a session"

该错误表示：**必须指定会话**，CLI 才能知道将消息发送到哪个 agent/session。

### 解决方法

为命令添加 `--agent main`（或对应 agent 名）：

```bash
# 错误
openclaw agent --message "你好"

# 正确
openclaw agent --message "你好" --agent main
```

TUI 默认使用 `agent main` / `session main`，CLI 也需显式指定。

---

## Node 版本管理（fnm）

OpenClaw 推荐 **Node 22+**。若使用 fnm 管理 Node 而不再使用 Homebrew：

### 1. 用 fnm 安装并设置 Node 22

```bash
fnm install 22
fnm use 22
fnm default 22
node -v   # 应显示 v22.x.x
```

### 2. 卸载 Homebrew 的 Node

```bash
brew uninstall node@20
```

### 3. 确保 Shell 使用 fnm

在 `~/.zshrc` 中确保有：

```bash
eval "$(fnm env)"
```

且该行放在 PATH 相关配置之后，保证 fnm 的 Node 优先于其他路径。

### 4. 重新加载配置

```bash
source ~/.zshrc
which node   # 应指向 fnm 目录，而非 /opt/homebrew/...
```

---

## Notion 简介

### 什么是 Notion？

**Notion** 是一款**一体化工作空间平台**，集成了笔记、数据库、项目管理、协作等功能。

### 主要功能

- **笔记与文档**：富文本、Markdown、代码块、嵌入媒体
- **数据库**：表格、看板、日历、画廊等视图
- **项目管理**：任务清单、进度追踪、团队协作
- **知识库**：个人或团队 Wiki

### 在 OpenClaw 中的作用

若安装 **Notion 技能**，助手可以：

- 创建、编辑 Notion 页面
- 搜索 Notion 内容
- 读取数据库信息
- 更新任务状态

### 是否需要安装？

- **使用 Notion**：推荐安装，可让助手操作你的 Notion 工作区。
- **不使用 Notion**：可跳过。

---

## 相关链接

- [入门指南](/start/getting-started)
- [故障排除](/help/troubleshooting)
- [WebChat 文档](/web/webchat)
- [网关配置](/gateway/configuration)
- [Z.AI Provider](/providers/zai)
