# AGENTS.md

This file defines repo-wide guidance for agents working in `drama-buddy`.

## Project Summary

`drama-buddy` is a `pnpm` monorepo for a multi-surface drama companion product:

- `apps/server`: Next.js server that provides chat, knowledge, pet, cast, OCR, and speech APIs.
- `apps/desktop`: React + Vite + Tauri desktop client, with Rust code under `src-tauri`.
- `apps/tv`: React + Vite TV client.
- `packages/shared`: shared types, hooks, utilities, knowledge models, and pet models.
- `e2e`: Playwright end-to-end coverage.

The core product loop is:

1. Client sends drama context and messages to the server.
2. Server builds a system prompt from drama knowledge.
3. Server streams tokens back over SSE-style responses.
4. Pet state and cast room state are updated as side effects.

## Workspace Layout

### `apps/server`

- Uses Next.js App Router under `src/app`.
- API routes live in `src/app/api/*/route.ts`.
- Server-only logic lives in `src/lib`.
- Shared imports should come from `@drama-buddy/shared`.
- App-local imports can use the `@/*` path alias.
- Routes using `better-sqlite3` must stay on the Node runtime.

Important modules:

- `src/lib/ai-client.ts`: provider abstraction for chat, vision, and ASR.
- `src/lib/prompt-builder.ts`: drama context to system prompt assembly.
- `src/lib/knowledge/*`: built-in drama knowledge registry and filtering.
- `src/lib/pet/engine.ts`: pet EXP, mood, stage, and accessory logic.
- `src/lib/db/*`: persistence for chat history and pet state.
- `src/app/api/cast/route.ts`: room-based cast event stream.

### `apps/desktop`

- Uses React + Vite for UI under `src`.
- Native desktop behavior lives in `src-tauri/src`.
- Tauri permissions/capabilities live in `src-tauri/capabilities`.
- When changing native functionality, keep TypeScript calls, Rust commands, and Tauri capability config in sync.

### `apps/tv`

- Uses React + Vite for a TV-first interaction model.
- Reads backend address from `VITE_SERVER_URL`.
- UI emphasizes remote-control and focus navigation behavior, so avoid changes that assume pointer-first interactions.

### `packages/shared`

- The only place for shared contracts across apps.
- Prefer adding shared request/response types, hooks, and domain models here instead of duplicating them per app.
- If a type is exchanged across app boundaries, move it here first.

### `e2e`

- Contains Playwright tests for cross-app or top-level flows.
- Prefer focused unit tests close to the touched module for domain logic changes.

## Runbook

Use `pnpm` only.

Repo-level commands:

- `pnpm install`
- `pnpm dev`
- `pnpm dev:server`
- `pnpm build`
- `pnpm test`
- `pnpm test:e2e`

App-level examples:

- `pnpm --filter @drama-buddy/server dev`
- `pnpm --filter @drama-buddy/server test`
- `pnpm --filter @drama-buddy/desktop dev`
- `pnpm --filter @drama-buddy/desktop tauri:dev`
- `pnpm --filter @drama-buddy/tv dev`

## Environment

### Server

- Copy `apps/server/.env.example` to `apps/server/.env.local`.
- `AI_PROVIDER`, `OPENAI_API_KEY`, `AI_MODEL`, and `VISION_MODEL` drive the AI stack.
- ASR is configured through `ASR_PROVIDER`, `ASR_API_KEY`, and `DOUBAO_ASR_APP_ID` when needed.
- Never commit real secrets.

### TV

- Copy `apps/tv/.env.example` and set `VITE_SERVER_URL` to the server address.
- Do not hardcode LAN IPs in source files; keep them in env config only.

## Working Rules

### Shared contracts first

- When API payloads or domain entities change, update `packages/shared` first.
- Keep request/response/event names aligned across server, desktop, and TV.
- Do not duplicate the same type shape in multiple apps.

### Preserve stream protocols

- `/api/chat` and `/api/cast` rely on streamed event payloads.
- If you change event shape or sequencing, update all consumers in the same change.
- Preserve backwards compatibility unless the task explicitly allows coordinated breakage.

### Keep domain logic out of UI

- Prompt building, pet progression, knowledge filtering, OCR parsing, and chat side effects belong in server or shared modules.
- UI components should mainly orchestrate rendering and interaction, not reimplement domain rules.

### Prefer local styles

- This repo already colocates most component styles in `*.css` files.
- Keep component-specific styles next to the component.
- Only use app-level global styles for true global concerns.

### Be careful with Tauri changes

- Desktop changes may require coordinated edits in:
  - `apps/desktop/src/*`
  - `apps/desktop/src-tauri/src/*`
  - `apps/desktop/src-tauri/capabilities/*`
  - `apps/desktop/src-tauri/tauri.conf.json`

### Respect runtime constraints

- `better-sqlite3` is Node-only. Do not move related code to Edge runtime.
- Browser-only code must not leak into server modules.
- Tauri-native code must not be imported into web-only apps.

## Testing Guidance

Run the smallest useful verification for the area you changed:

- server domain logic: `pnpm --filter @drama-buddy/server test`
- workspace-wide checks: `pnpm test`
- end-to-end flows: `pnpm test:e2e`

Add or update tests when changes affect:

- prompt construction
- knowledge filtering
- pet EXP, mood, or evolution logic
- API request validation or stream event shape
- cross-app shared contracts

Avoid adding superficial tests that only restate the implementation.

## Change Patterns

### Good changes

- Add new shared types in `packages/shared`, then consume them in apps.
- Extend server APIs while keeping stream payloads explicit and typed.
- Add focused tests for prompt builder, knowledge logic, or pet engine.
- Keep UI changes scoped to a single surface unless the feature is intentionally cross-platform.

### Risky changes

- Changing SSE payload structures without updating all clients.
- Adding app-specific copies of shared domain types.
- Moving Node-dependent code into non-Node runtimes.
- Mixing native Tauri concerns directly into reusable web modules.

## Common Task Templates

### Template: Change an API

Use this flow when adding or modifying any endpoint under `apps/server/src/app/api`.

1. Confirm whether request, response, or event payloads are shared across apps.
2. If shared, update types in `packages/shared` first.
3. Edit the route in `apps/server/src/app/api/*/route.ts`.
4. Move reusable business logic into `apps/server/src/lib/*` instead of bloating the route handler.
5. If the API streams data, verify event names, payload shape, and ordering against all consumers.
6. Update clients in `apps/tv`, `apps/desktop`, or `packages/shared/hooks` if they consume the changed contract.
7. Add or update focused tests near the affected server logic.

Files commonly involved:

- `packages/shared/src/types/*`
- `packages/shared/src/index.ts`
- `apps/server/src/app/api/*/route.ts`
- `apps/server/src/lib/*`
- client hooks or API callers under `packages/shared/src/hooks/*`, `apps/tv/src/*`, or `apps/desktop/src/*`

Minimum verification:

- `pnpm --filter @drama-buddy/server test`
- If client-visible payloads changed, also verify the affected client flow manually or with targeted tests

Done checklist:

- Shared contracts updated first when needed
- Stream payloads still match all consumers
- Route stays compatible with the required runtime

### Template: Change TV UI

Use this flow when changing screens, components, layout, focus behavior, or interaction patterns in `apps/tv`.

1. Identify the screen or component under `apps/tv/src/*`.
2. Keep UI-specific changes in TV components and colocated `*.css` files.
3. Preserve remote-control navigation and focus order, especially when changing lists, panels, and action groups.
4. If the TV UI consumes shared data models or hooks, update them in `packages/shared` instead of redefining them locally.
5. Avoid introducing desktop-only or pointer-first interaction assumptions.
6. If the UI depends on a new backend contract, follow the API template first.

Files commonly involved:

- `apps/tv/src/components/*`
- `apps/tv/src/hooks/*`
- `apps/tv/src/styles/*`
- `apps/tv/src/App.tsx`
- `packages/shared/src/hooks/*`
- `packages/shared/src/types/*`

Minimum verification:

- `pnpm --filter @drama-buddy/tv dev`
- Manual focus/navigation check for the touched flow
- If shared logic changed, run the smallest related test command as well

Done checklist:

- Focus movement still works in the touched view
- Component styles remain local and scoped
- No duplicated shared types were introduced in the TV app

### Template: Change a Tauri Capability

Use this flow when desktop work requires a new native command, permission, shell access, screenshot behavior, or config update.

1. Identify the user-facing desktop entry point in `apps/desktop/src/*`.
2. Identify the Rust implementation in `apps/desktop/src-tauri/src/*`.
3. Add or update the Tauri command, native function, or module in Rust.
4. Wire the TypeScript caller in the desktop app to the Rust command.
5. Update capability or permission files in `apps/desktop/src-tauri/capabilities/*` when the native surface changes.
6. Review `apps/desktop/src-tauri/tauri.conf.json` if packaging, allowlists, windows, or plugins are affected.
7. Keep native-only code isolated from shared web modules.

Files commonly involved:

- `apps/desktop/src/*`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src-tauri/src/*.rs`
- `apps/desktop/src-tauri/capabilities/*`
- `apps/desktop/src-tauri/tauri.conf.json`

Minimum verification:

- `pnpm --filter @drama-buddy/desktop tauri:dev`
- Manual validation of the native flow from the desktop UI

Done checklist:

- TypeScript caller, Rust command, and capability config are aligned
- No web-only module imports native desktop code
- Any required Tauri config updates were included in the same change

## Agent Checklist

Before finishing, verify:

1. Changed types are shared from the correct package.
2. Stream/event payloads still match their consumers.
3. The smallest relevant test or build step was run.
4. No secrets or machine-specific addresses were committed.
5. Desktop native changes include any required Rust/capability updates.
