# AGENTS.md

This file adds shared-package rules for `packages/shared`.

## Scope

- `src/types/*`: cross-app type contracts.
- `src/hooks/*`: shared client hooks for chat, cast, speech, OCR, and identity.
- `src/knowledge/*`: shared knowledge-facing types and exports.
- `src/pet/*`: shared pet-facing types and exports.
- `src/components/*` and `src/utils/*`: reusable client-safe helpers.

## Rules

- Treat this package as the source of truth for cross-app contracts.
- Add or update shared types here before changing API payloads consumed by multiple apps.
- Keep exports stable and update `src/index.ts` or subpath exports when introducing new public modules.
- Shared code must remain safe for app consumers; do not import Tauri-native, server-only, or Node-only modules here.
- Hooks should stay transport-aware but UI-agnostic so they can be reused by both desktop and TV.
- When changing stream event handling, coordinate updates with server payloads and client consumers in the same task.

## Common Touchpoints

- Root exports: `src/index.ts`
- Shared hooks: `src/hooks/*`
- Shared types: `src/types/index.ts`
- Domain models: `src/knowledge/*`, `src/pet/*`
- Utilities and reusable components: `src/utils/*`, `src/components/*`

## Verification

- Run the smallest consuming app or test flow affected by the change.
- Run `pnpm --filter @drama-buddy/server test` when shared contracts impact server behavior.
- Manually verify desktop or TV flows if a hook contract changed.

## Watchouts

- Do not add app-specific copies of shared contracts in consuming apps.
- Do not import browser-only or desktop-only runtime APIs into reusable modules unless every consumer can support them.
- Do not change exported hook behavior without verifying all known consumers.
