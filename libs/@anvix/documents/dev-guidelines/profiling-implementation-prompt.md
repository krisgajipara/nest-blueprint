# API Profiler Maintenance Guide

The request-scoped API profiler is already implemented. This document replaces the old implementation prompt and describes the current files, behavior, and maintenance checklist.

Last verified against repo: 2026-05-04

Verified files:
- `libs/@anvix/server-core/shared-modules/profiler/app-profiler.service.ts`
- `libs/@anvix/server-core/shared-modules/profiler/app-profiler.module.ts`
- `libs/@anvix/server-core/interceptors/profiler.interceptor.ts`
- `libs/@anvix/server-core/shared-modules/cache/app-cache.service.ts`
- `libs/@anvix/server-core/assets/profiler-dashboard.html`
- `libs/@anvix/server-core/assets/profiler-dashboard.js`
- `src/modules/profiler/profiling.controller.ts`
- `src/modules/profiler/profiling.module.ts`
- `src/main.ts`

## Purpose

The profiler captures per-endpoint runtime metrics without database persistence.

It tracks:

- total calls
- min response time
- average response time
- P95 response time
- max response time
- error count
- cache hits
- cache misses
- slow endpoints
- high error-rate endpoints

## Current File Map

```text
libs/@anvix/server-core/shared-modules/profiler/
|-- app-profiler.module.ts                 # Profiler module provider
`-- app-profiler.service.ts                # In-memory metrics and AsyncLocalStorage context

libs/@anvix/server-core/interceptors/
`-- profiler.interceptor.ts                # Global request timing and path normalization

libs/@anvix/server-core/shared-modules/cache/
`-- app-cache.service.ts                   # Reports cache hit/miss to profiler context

libs/@anvix/server-core/assets/
|-- profiler-dashboard.html                # Dashboard HTML
`-- profiler-dashboard.js                  # Dashboard client JavaScript

src/modules/profiler/
|-- profiling.controller.ts                # Profiler API and dashboard routes
`-- profiling.module.ts                    # Profiler Nest module
```

## Runtime Wiring

`src/main.ts` registers the profiler globally:

```typescript
const profilingService = app.get(ProfilerService);
app.useGlobalInterceptors(new ReqResInterceptor(), new ProfilerInterceptor(profilingService));
```

This means every HTTP request can be profiled unless the interceptor excludes it.

## ProfilerService

`ProfilerService` stores profiles in an in-memory `Map<string, ApiProfile>`.

Important behavior:

- Uses `AsyncLocalStorage<ProfilerContext>` to track cache hits/misses for the current request.
- Keeps a sliding window of recent latencies for P95 calculation.
- Exposes summary, slow endpoint, high error-rate, and clear operations.
- Does not persist metrics to the database.

Main methods:

```text
runWithContext()
enterWithContext()
recordCacheHit()
recordCacheMiss()
recordProfile()
getAllProfiles()
getProfile()
getSummary()
getHighErrorRateEndpoints()
getSlowEndpoints()
clearAllProfiles()
getContext()
```

## ProfilerInterceptor

`ProfilerInterceptor`:

- records request start time
- normalizes endpoint paths
- creates a profiler context for cache hit/miss counting
- records successful requests through `tap`
- records failed requests through `catchError`
- uses `setImmediate()` before updating profile metrics

Path normalization:

- uses `request.route?.path` when available
- strips query params
- replaces UUID segments with `:uuid`
- replaces numeric segments with `:id`

Excluded routes:

```text
/v1
/v1/profiler*
/v1/profiler-ui*
```

## Cache Instrumentation

`AppCacheService.get()` reports cache activity:

- cache value exists: `recordCacheHit()`
- cache value missing: `recordCacheMiss()`

If no profiler context exists, `ProfilerService` logs a warning and continues.

## Profiler API

Current controller routes:

```text
GET  /profiler                 # { summary, profiles }
GET  /profiler/summary         # summary only
GET  /profiler/slow            # endpoints with average latency > 500ms
GET  /profiler/errors          # endpoints with error rate > 5% and more than 10 calls
POST /profiler/clear           # clear in-memory profiles
GET  /profiler-ui              # dashboard HTML
GET  /profiler-ui/script.js    # dashboard JS
```

Depending on global prefix configuration, these may be served under `/v1/...`.

## Dashboard Assets

Dashboard assets are served from:

```text
libs/@anvix/server-core/assets/profiler-dashboard.html
libs/@anvix/server-core/assets/profiler-dashboard.js
```

The controller first attempts to load assets from the compiled path and falls back to `process.cwd()` during development.

## Maintenance Checklist

- [ ] Keep profiler routes excluded from profiling to avoid recursive dashboard/API noise.
- [ ] Preserve path normalization to avoid high-cardinality metric keys.
- [ ] Keep profiler storage in memory unless there is an explicit product requirement for persistence.
- [ ] Avoid blocking request completion while updating metrics.
- [ ] Keep cache hit/miss recording best-effort; cache metrics should never break requests.
- [ ] Update this guide if profiler endpoint paths change.
- [ ] Update dashboard assets and this guide together when UI behavior changes.

## Known Follow-Up Opportunities

- The interceptor currently accesses `ProfilerService.storage` through `(this.profilingService as any).storage`. Prefer exposing a public method on `ProfilerService` for running with a provided context.
- `ProfilerService` logs warnings when cache hit/miss is recorded without context. If logs become noisy, downgrade this to debug-level or make it configurable.
- Dashboard file loading uses `require("fs")` and `require("path")` inside controller methods. This works, but can be refactored to top-level imports for consistency.

