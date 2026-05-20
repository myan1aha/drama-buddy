# AGENTS.md

This file adds server-specific rules for `apps/server`.

## Scope

- `src/app/api/*/route.ts`: HTTP and streaming endpoints.
- `src/lib/*`: server-only business logic.
- `src/lib/knowledge/*`: built-in drama knowledge sources and filtering.
- `src/lib/pet/*`: pet progression, mood, and reward logic.
- `src/lib/db/*`: persistence for chat history and pet state.

## Rules

- Keep route handlers thin; move reusable logic into `src/lib/*`.
- Update shared request, response, and event types in `packages/shared` before changing cross-app contracts.
- Preserve `/api/chat` and `/api/cast` event names, payload shape, and sequencing unless all consumers are updated together.
- Keep Node-only dependencies, especially `better-sqlite3`, on the Node runtime.
- Do not move prompt building, knowledge filtering, pet logic, or OCR parsing into UI code.
- Prefer explicit validation and clear error responses for all public API changes.

## Common Touchpoints

- API routes: `src/app/api/*/route.ts`
- Prompt assembly: `src/lib/prompt-builder.ts`
- AI provider behavior: `src/lib/ai-client.ts`
- Knowledge registry: `src/lib/knowledge/*`
- Pet engine: `src/lib/pet/engine.ts`
- Persistence: `src/lib/db/index.ts`

## Verification

- Run `pnpm --filter @drama-buddy/server test` for logic or API changes.
- Run `pnpm --filter @drama-buddy/server dev` for endpoint-level manual validation.
- If stream payloads changed, verify the affected client flow at the same time.

## Watchouts

- Do not change SSE event payloads without updating `packages/shared` hooks and client consumers.
- Do not import browser-only APIs into server modules.
- Do not hide contract changes inside ad hoc inline objects when a shared type should exist.
