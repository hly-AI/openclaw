#!/usr/bin/env node
/**
 * Sync docs/ to docs_zh/ preserving structure.
 * - For each .md/.mdx in docs/, if docs_zh/<same path> does not exist,
 *   copy the file to docs_zh and add front-matter note "translation: pending".
 * - Existing files in docs_zh are never overwritten.
 *
 * Run from repo root: node scripts/sync-docs-zh.mjs  (or bun scripts/sync-docs-zh.ts)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCS = "docs";
const DOCS_ZH = "docs_zh";

function* walkMd(dir: string, base = ""): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === "assets" || e.name === "images" || e.name === "_layouts" || e.name.startsWith(".")) {
        continue;
      }
      yield* walkMd(path.join(dir, e.name), rel);
    } else if (e.isFile() && (e.name.endsWith(".md") || e.name.endsWith(".mdx"))) {
      yield rel;
    }
  }
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function addPendingNote(content: string): string {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (fmMatch) {
    const rest = content.slice(fmMatch[0].length);
    const fm = fmMatch[1];
    const hasTranslation = /^translation:\s/m.test(fm);
    if (hasTranslation) return content;
    const newFm = fm.trimEnd() + "\ntranslation: pending\n";
    return `---\n${newFm}---\n${rest}`;
  }
  return "---\ntranslation: pending\n---\n\n" + content;
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const docsDir = path.join(repoRoot, DOCS);
  const docsZhDir = path.join(repoRoot, DOCS_ZH);

  if (!fs.existsSync(docsDir)) {
    console.error("docs/ not found");
    process.exit(1);
  }

  let copied = 0;
  let skipped = 0;

  for (const rel of walkMd(docsDir)) {
    const src = path.join(docsDir, rel);
    const dest = path.join(docsZhDir, rel);
    if (fs.existsSync(dest)) {
      skipped += 1;
      continue;
    }
    ensureDir(dest);
    const content = fs.readFileSync(src, "utf8");
    const out = addPendingNote(content);
    fs.writeFileSync(dest, out, "utf8");
    copied += 1;
    console.log("+ " + rel);
  }

  console.log(`\nCopied: ${copied}, Skipped (already present): ${skipped}`);
}

main();
