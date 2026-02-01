---
summary: "安装 OpenClaw（推荐安装脚本、全局安装或从源码）"
read_when:
  - 安装 OpenClaw
  - 希望从 GitHub 安装
title: "安装"
---

# 安装

除非有特殊需求，建议使用安装脚本。它会配置 CLI 并运行引导。

## 快速安装（推荐）

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Windows（PowerShell）：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

下一步（若跳过了引导）：

```bash
openclaw onboard --install-daemon
```

## 系统要求

- **Node >=22**
- macOS、Linux 或通过 WSL2 的 Windows
- 仅从源码构建时需要 `pnpm`

## 选择安装方式

### 1) 安装脚本（推荐）

通过 npm 全局安装 `openclaw` 并运行引导。

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

安装脚本参数：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --help
```

详情：[安装脚本说明](/install/installer)。

非交互（跳过引导）：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard
```

### 2) 全局安装（手动）

若已安装 Node：

```bash
npm install -g openclaw@latest
```

若系统已全局安装 libvips（macOS 上常见于 Homebrew）且 `sharp` 安装失败，可强制使用预编译二进制：

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

若出现 `sharp: Please add node-gyp to your dependencies`，可安装构建工具（macOS：Xcode CLT + `npm install -g node-gyp`）或使用上述 `SHARP_IGNORE_GLOBAL_LIBVIPS=1` 跳过原生构建。

或：

```bash
pnpm add -g openclaw@latest
```

### 3) 从源码

克隆仓库后：

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
```

使用本地 CLI：`pnpm openclaw ...` 或 `node openclaw.mjs ...`。

更多选项与更新/卸载说明见英文版 [Install](/install)。
