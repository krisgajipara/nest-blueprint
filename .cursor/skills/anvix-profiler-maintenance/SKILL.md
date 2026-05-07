---
name: anvix-profiler-maintenance
description: Maintain the in-memory API profiler in Anvix backend, including interceptor behavior, cache instrumentation, route exclusions, and dashboard assets. Use when modifying profiler metrics, APIs, or profiling UI behavior.
---

# Anvix Profiler Maintenance

## Use This Skill When

- Updating profiler service logic.
- Adjusting profiler interceptor behavior or path normalization.
- Changing profiler API routes or dashboard assets.
- Debugging cache hit/miss instrumentation.

## Primary Reference

- `libs/@anvix/documents/dev-guidelines/profiling-implementation-prompt.md`

## Key Invariants

- Profiler remains in-memory unless persistence is explicitly required.
- Profiler routes remain excluded from profiling.
- Path normalization stays enabled to avoid high-cardinality keys.
- Metrics recording should not block request completion.
- Cache hit/miss tracking is best effort and must not break requests.

## Maintenance Checklist

- Verify global interceptor registration is still correct.
- Verify route exclusion list still matches profiler and dashboard endpoints.
- Verify latency and error metrics still update on both success and failure paths.
- Verify cache service still reports hit/miss through profiler context.
- Verify dashboard asset loading works in both compiled and dev paths.
- Update guide docs when changing behavior.

## Known Follow-Ups To Keep In Mind

- Avoid private/unsafe access patterns to internal profiler storage.
- Keep warning logs around missing profiler context at appropriate verbosity.
- Prefer consistent import style for `fs`/`path` use in controllers.

## Required Output

When done, report:

- behavior changed
- files changed
- compatibility and migration notes (if any)
- verification performed (manual/API route checks)
