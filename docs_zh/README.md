---
summary: "OpenClaw 中文文档目录说明"
title: "中文文档"
---

# 中文文档（docs_zh）

本目录为 OpenClaw 文档的中文版本，与 `docs/` 目录结构一致。

## 当前状态

- **已完整翻译为中文的页面**：首页（`index.md`）、入门指南（`start/getting-started.md`）、文档中心（`start/hubs.md`）、配置（`start/setup.md`）、配对（`start/pairing.md`）、帮助（`help/index.md`）、故障排除（`help/troubleshooting.md`）、网关运维（`gateway/index.md`）、安装（`install/index.md`）、网关架构（`concepts/architecture.md`），以及本 README。
- **其余页面**：已从 `docs/` 同步到 `docs_zh/`，内容为英文并在 front matter 中标记 `translation: pending`，可后续用翻译服务或人工逐批翻译。
- **内部链接**：已翻译页面中的链接仍使用根相对路径（如 `/start/getting-started`），若将 `docs_zh` 部署为独立站点或挂在 `/zh/` 下，需根据实际部署调整 base URL 或链接前缀。

## 如何生成/更新 docs_zh

从仓库根目录运行：

```bash
node scripts/sync-docs-zh.mjs
```

或（若已安装 bun）：

```bash
bun scripts/sync-docs-zh.ts
```

该脚本会将 `docs/` 下所有 `.md`/`.mdx` 同步到 `docs_zh/`；若某文件在 `docs_zh/` 中不存在则复制英文版并在 front matter 中标记 `translation: pending`，**已存在的中文版不会被覆盖**。

## 如何在本机浏览

任选其一即可：

### 方式一：Docsify（推荐，零安装）

在项目根目录执行：

```bash
npx serve docs_zh -p 3333
```

然后在浏览器打开：**http://localhost:3333**。左侧为侧栏导航，支持搜索。

### 方式二：Mintlify（与线上文档站一致）

若已安装 [Mintlify CLI](https://mintlify.com/docs/installation)（`npm i -g mintlify`），在项目根目录执行：

```bash
cd docs_zh && npx mintlify dev
```

需先将 `docs/docs.json` 复制到 `docs_zh/docs.json`（或从 docs 目录用 `mintlify dev` 浏览英文文档）。

### 方式三：在 Cursor / VS Code 里看单页

打开任意 `.md` 文件，按 **Ctrl+Shift+V**（Windows/Linux）或 **Cmd+Shift+V**（macOS）打开 Markdown 预览；或右键该文件 →「Open Preview」。

---

## 英文文档

- 在线站：<https://docs.openclaw.ai/>
- 仓库源：`docs/`
- 本地英文预览：在项目根目录执行 `pnpm docs:dev`（需 Mintlify CLI，会启动 `mint dev`）
