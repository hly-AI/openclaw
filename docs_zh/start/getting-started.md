---
summary: "入门指南：从零到第一条消息（向导、鉴权、通道、配对）"
read_when:
  - 首次从零配置
  - 需要最快路径：安装 → 引导 → 第一条消息
title: "入门指南"
---

# 入门指南

目标：尽快从 **零** 到 **第一次可用对话**（使用合理默认值）。

最快对话方式：打开控制界面（无需先配置通道）。运行 `openclaw dashboard` 在浏览器中聊天，或在网关主机上打开 `http://127.0.0.1:18789/`。详见 [控制台](/web/dashboard) 与 [控制界面](/web/control-ui)。

推荐路径：使用 **CLI 引导向导**（`openclaw onboard`）。它会配置：

- 模型/鉴权（推荐 OAuth）
- 网关设置
- 通道（WhatsApp/Telegram/Discord/Mattermost（插件）/…）
- 配对默认（安全私信）
- 工作区引导与技能
- 可选后台服务

若需要更详细的参考，可跳转：[向导](/start/wizard)、[配置](/start/setup)、[配对](/start/pairing)、[安全](/gateway/security)。

沙箱说明：`agents.defaults.sandbox.mode: "non-main"` 使用 `session.mainKey`（默认 `"main"`），因此群组/频道会话在沙箱中运行。若希望主代理始终在主机上运行，可为该代理单独覆盖：

```json
{
  "routing": {
    "agents": {
      "main": {
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      }
    }
  }
}
```

## 0) 前置条件

- Node `>=22`
- `pnpm`（可选；从源码构建时推荐）
- **推荐：** Brave Search API 密钥用于网页搜索。最简单：`openclaw configure --section web`（会保存 `tools.web.search.apiKey`）。见 [Web 工具](/tools/web)。

macOS：若计划构建应用，需安装 Xcode / CLT。仅 CLI + 网关时，有 Node 即可。  
Windows：请使用 **WSL2**（推荐 Ubuntu）。强烈建议 WSL2；原生 Windows 未经充分测试且工具兼容性较差。先安装 WSL2，再在 WSL 内按 Linux 步骤操作。见 [Windows (WSL2)](/platforms/windows)。

## 1) 安装 CLI（推荐）

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

安装选项（安装方式、非交互、从 GitHub）：见 [安装](/install)。

Windows（PowerShell）：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

替代方式（全局安装）：

```bash
npm install -g openclaw@latest
```

```bash
pnpm add -g openclaw@latest
```

## 2) 运行引导向导（并安装服务）

```bash
openclaw onboard --install-daemon
```

你将选择：

- **本地或远程** 网关
- **鉴权**：OpenAI Code (Codex) 订阅（OAuth）或 API 密钥。Anthropic 推荐使用 API 密钥；也支持 `claude setup-token`。
- **提供商**：WhatsApp 扫码登录、Telegram/Discord 机器人令牌、Mattermost 插件令牌等。
- **守护进程**：后台安装（launchd/systemd；WSL2 使用 systemd）
  - **运行时**：Node（推荐；WhatsApp/Telegram 必须）。不推荐 Bun。
- **网关令牌**：向导默认会生成一个（即使仅回环）并保存到 `gateway.auth.token`。

向导详情：[向导](/start/wizard)

### 鉴权存储位置（重要）

- **推荐 Anthropic 方式：** 设置 API 密钥（向导可代为保存供服务使用）。若想复用 Claude Code 凭据，也可使用 `claude setup-token`。

- OAuth 凭据（旧版导入）：`~/.openclaw/credentials/oauth.json`
- 鉴权配置（OAuth + API 密钥）：`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`

无头/服务器提示：先在普通机器上完成 OAuth，再将 `oauth.json` 复制到网关主机。

## 3) 启动网关

若在引导时安装了服务，网关应已在运行：

```bash
openclaw gateway status
```

手动运行（前台）：

```bash
openclaw gateway --port 18789 --verbose
```

控制台（本地回环）：`http://127.0.0.1:18789/`  
若已配置令牌，在控制界面设置中粘贴（保存为 `connect.params.auth.token`）。

⚠️ **Bun 与 WhatsApp/Telegram：** Bun 在这些通道上存在已知问题。若使用 WhatsApp 或 Telegram，请用 **Node** 运行网关。

## 3.5) 快速自检（约 2 分钟）

```bash
openclaw status
openclaw health
openclaw security audit --deep
```

## 4) 配对并连接第一个聊天界面

### WhatsApp（扫码登录）

```bash
openclaw channels login
```

在 WhatsApp → 设置 → 已关联设备 中扫码。

WhatsApp 文档：[WhatsApp](/channels/whatsapp)

### Telegram / Discord / 其他

向导可代为填写令牌/配置。若希望手动配置，可参考：

- Telegram：[Telegram](/channels/telegram)
- Discord：[Discord](/channels/discord)
- Mattermost（插件）：[Mattermost](/channels/mattermost)

**Telegram 私信提示：** 第一次私信会返回配对码。需在下一步中批准，否则机器人不会回复。

## 5) 私信安全（配对审批）

默认策略：未知私信会收到短码，消息在批准前不会处理。若第一次私信没有回复，请先批准配对：

```bash
openclaw pairing list whatsapp
openclaw pairing approve whatsapp <code>
```

配对文档：[配对](/start/pairing)

## 从源码运行（开发）

若你在改 OpenClaw 本身，可从源码运行：

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build # 首次运行会自动安装 UI 依赖
pnpm build
openclaw onboard --install-daemon
```

若尚未全局安装，可在仓库目录下用 `pnpm openclaw ...` 执行引导。  
`pnpm build` 也会打包 A2UI 资源；若只需执行该步，可使用 `pnpm canvas:a2ui:bundle`。

从本仓库启动网关：

```bash
node openclaw.mjs gateway --port 18789 --verbose
```

## 7) 端到端验证

在新终端中发送测试消息：

```bash
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

若 `openclaw health` 显示「未配置鉴权」，请回到向导配置 OAuth/密钥，否则代理无法回复。

提示：`openclaw status --all` 可生成最易粘贴的只读调试报告。  
健康探测：`openclaw health`（或 `openclaw status --deep`）会向运行中的网关请求健康快照。

## 下一步（可选但推荐）

- macOS 菜单栏应用 + 语音唤醒：[macOS 应用](/platforms/macos)
- iOS/Android 节点（Canvas/相机/语音）：[节点](/nodes)
- 远程访问（SSH 隧道 / Tailscale Serve）：[远程访问](/gateway/remote) 与 [Tailscale](/gateway/tailscale)
- 常开 / VPN 部署：[远程访问](/gateway/remote)、[exe.dev](/platforms/exe-dev)、[Hetzner](/platforms/hetzner)、[macOS 远程](/platforms/mac/remote)
