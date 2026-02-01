---
summary: "配置指南：在保持个人配置的同时保持最新"
read_when:
  - 配置新机器
  - 希望「最新最好」且不破坏个人环境
title: "配置"
---

# 配置

最后更新：2026-01-01

## 简要

- **个性化放在仓库外：** `~/.openclaw/workspace`（工作区）+ `~/.openclaw/openclaw.json`（配置）。
- **稳定工作流：** 安装 macOS 应用，由其运行内置网关。
- **前沿工作流：** 自行通过 `pnpm gateway:watch` 运行网关，再让 macOS 应用以本地模式连接。

## 前置条件（从源码）

- Node `>=22`
- `pnpm`
- Docker（可选；仅用于容器化部署/端到端，见 [Docker](/install/docker)）

## 个性化策略（便于更新）

若希望「完全按我定制」且便于更新，请将自定义内容放在：

- **配置：** `~/.openclaw/openclaw.json`（JSON/JSON5 风格）
- **工作区：** `~/.openclaw/workspace`（技能、提示、记忆；可做成私有 git 仓库）

一次性引导：

```bash
openclaw setup
```

在仓库内使用本地 CLI 入口：

```bash
openclaw setup
```

若尚未全局安装，可用 `pnpm openclaw setup` 运行。

## 稳定工作流（以 macOS 应用为主）

1. 安装并启动 **OpenClaw.app**（菜单栏）。
2. 完成引导/权限清单（TCC 提示）。
3. 确认网关为 **本地** 且正在运行（由应用管理）。
4. 关联界面（例如 WhatsApp）：

```bash
openclaw channels login
```

5. 自检：

```bash
openclaw health
```

若当前构建中无引导：

- 运行 `openclaw setup`，再 `openclaw channels login`，然后手动启动网关（`openclaw gateway`）。

## 前沿工作流（在终端中运行网关）

目标：在 TypeScript 网关上开发、热重载，并让 macOS 应用保持连接。

### 0)（可选）从源码运行 macOS 应用

若也希望 macOS 应用保持前沿版本：

```bash
./scripts/restart-mac.sh
```

### 1) 启动开发网关

在仓库目录下：

```bash
pnpm gateway:watch
```

网关会在配置的端口（默认 18789）上运行，代码变更后自动重载。macOS 应用以本地模式连接该网关即可。

更多步骤与远程/多实例说明见英文版 [Setup](/start/setup)。
