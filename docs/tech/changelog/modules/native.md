# Module Changelog: native

## 2026-03-17 | 2026-03-17-capacitor-android-p0-scaffold
- Summary: 新增 `apps/native` 原生端包，建立 Capacitor 配置、环境样例、占位 webDir 和目录骨架，为 Android 容器开发提供 P0 起点。
- Files:
  - `apps/native/package.json`
  - `apps/native/package-lock.json`
  - `apps/native/capacitor.config.ts`
  - `apps/native/.env.example`
  - `apps/native/README.md`
  - `apps/native/scripts/ensure-android-project.cjs`
  - `apps/native/web/index.html`
  - `apps/native/android/**`
  - `apps/native/assets/.gitkeep`
  - `apps/native/bridge/.gitkeep`
  - `apps/native/shared/.gitkeep`
  - `docs/tech/changelog/conversations/2026-03-17.md`
  - `docs/tech/changelog/modules/native.md`
- Notes: 本次已完成 Android 容器生成与一次 sync 验证，但未进行真机构建或原生安全存储接入。

## 2026-03-12 | 2026-03-12-vibe-coding-rules
- Summary: 当前对话未新增 native 规则改动。
- Files:
  - `.codex/rules/native/bridge.md` (no change in this dialogue)
  - `.codex/rules/native/structure.md` (no change in this dialogue)
- Notes: 预留模块日志文件，后续有改动直接追加。
