# AGENTS.md

This file adds TV-specific rules for `apps/tv`.

## Scope

- `src/components/*`: TV-facing UI and interaction components.
- `src/hooks/*`: TV-only hooks such as D-pad navigation.
- `src/styles/*`: TV app and global styling.
- `android/*`: Android packaging and runtime wrapper files.

## Rules

- Design for remote control and focus navigation first, not pointer-first desktop interactions.
- Keep component-specific styles colocated in `*.css` files.
- Preserve `.tv-focusable` behavior and focus order when changing layouts, panels, or action groups.
- Reuse shared hooks and types from `packages/shared` instead of redefining cross-app contracts locally.
- If a TV UI change depends on a backend contract change, update the server and shared types in the same task.
- Keep Android wrapper changes scoped to packaging or platform needs; do not mix them into normal UI work without a reason.

## Common Touchpoints

- Main app shell: `src/App.tsx`
- TV components: `src/components/*`
- Navigation behavior: `src/hooks/use-dpad-navigation.ts`
- Styling: `src/styles/*`, `src/components/*.css`
- Runtime config: `.env.example`, `vite.config.ts`, `android/*`

## Verification

- Run `pnpm --filter @drama-buddy/tv dev` for UI validation.
- Manually test focus movement, Enter key behavior, and the touched playback or chat flow.
- If shared hooks or types changed, run the smallest related verification command too.

## Watchouts

- Do not break keyboard and D-pad navigation when refactoring markup.
- Do not introduce duplicate request or event types inside the TV app.
- Do not hardcode server addresses in source files; keep them in env config.
