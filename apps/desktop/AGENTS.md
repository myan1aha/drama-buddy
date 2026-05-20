# AGENTS.md

This file adds desktop-specific rules for `apps/desktop`.

## Scope

- `src/*`: React + Vite desktop UI.
- `src-tauri/src/*`: Rust native implementation.
- `src-tauri/capabilities/*`: Tauri capability and permission config.
- `src-tauri/tauri.conf.json`: window, packaging, and plugin configuration.

## Rules

- Treat each change as either UI-only or native-linked before editing files.
- Keep native logic in Tauri and Rust, not inside React components.
- When adding or changing a native capability, update the TypeScript caller, Rust command, and capability config together.
- Review `src-tauri/tauri.conf.json` whenever plugins, windows, packaging, or desktop runtime behavior change.
- Keep Tauri-only code inside `apps/desktop`; do not move it into `packages/shared`.
- Reuse shared types from `packages/shared`, but do not leak desktop-only APIs into shared web modules.

## Common Touchpoints

- UI: `src/App.tsx`, `src/components/*`
- Frontend command wiring: `src/*`
- Native commands: `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`, `src-tauri/src/*.rs`
- Capabilities: `src-tauri/capabilities/*`
- Desktop config: `src-tauri/tauri.conf.json`

## Verification

- Run `pnpm --filter @drama-buddy/desktop dev` for UI-only changes.
- Run `pnpm --filter @drama-buddy/desktop tauri:dev` for any native-linked change.
- Manually verify the full desktop flow when commands, screenshots, shell access, or permissions changed.

## Watchouts

- Do not call an unregistered Rust command from TypeScript.
- Do not forget capability updates for screenshot, shell, file, or system features.
- Do not move desktop-only code into `packages/shared`.
