## Summary

请简要说明这次 PR 做了什么，以及为什么需要这次改动。

## Scope

- [ ] `apps/server`
- [ ] `apps/desktop`
- [ ] `apps/tv`
- [ ] `packages/shared`
- [ ] `e2e`
- [ ] 文档

## Changes

- 
- 
- 

## Verification

请列出你实际执行过的验证方式：

- [ ] `pnpm --filter @drama-buddy/server test`
- [ ] `pnpm --filter @drama-buddy/tv dev`
- [ ] `pnpm --filter @drama-buddy/desktop tauri:dev`
- [ ] `pnpm test:e2e`
- [ ] 手工验证

补充说明：

```text

```

## Contract Impact

如果本次改动涉及跨端契约，请确认：

- [ ] 已更新 `packages/shared`
- [ ] 已检查 API request / response 兼容性
- [ ] 已检查 SSE / Cast 事件结构兼容性
- [ ] 不涉及跨端契约变更

## UI / UX Notes

如果有界面改动，请补充截图、录屏或交互说明。

## Checklist

- [ ] 改动范围清晰且必要
- [ ] 没有引入无关改动
- [ ] 已执行最小必要验证
- [ ] 如有文档影响，已更新 `README.md` 或 `AGENTS.md`
