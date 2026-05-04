# PROMPT: Implement Request-Scoped API Profiler & Cache Monitoring V2

**Goal**: Build a high-performance, real-time API profiler tool for a NestJS application that captures latency (Min, Avg, P95, Max), error rates, and cache hit/miss statistics per endpoint, visualized in a premium futuristic dashboard.

---

### Phase 1: Core Profiler Service (@core-shared-modules)

Implement a `ProfilerService` that manages the state and request-context. This should reside in `libs/@oc/server-core/shared-modules/profiler/`.

1. **State Management**: Use an in-memory `Map<string, ApiProfile>` to store metrics. Avoid DB persistence to ensure zero latency impact.
2. **Request Context**:
    - Use `node:async_hooks` `AsyncLocalStorage`.
    - Provide methods `runWithContext<T>(fn: () => T | Promise<T>): T | Promise<T>` and `enterWithContext(): void` to wrap executions.
3. **Metrics Calculation**:
    - **Average**: Cumulative average.
    - **Min/Max**: Track absolute boundaries.
    - **P95 (95th Percentile)**: Maintain a sliding window of the last 100 latencies. Sort and pick the 95th index to capture tail latency.
4. **Non-Blocking Logic**: Always use `setImmediate()` when updating the Map to ensure the profiler logic doesn't block the API response.
5. **Additional Features**:
    - Record cache hits/misses per request context.
    - Provide summary statistics: total endpoints, total calls, cache hit/miss counts, average latency, slowest/fastest endpoints.
    - Identify high error rate endpoints (>5% errors with >10 calls).
    - Identify slow endpoints (average >500ms).

### Phase 2: The Interceptor (Context Provider & Path Normalizer)

Implement a global `ProfilerInterceptor`.

1. **Path Normalization (CRITICAL)**:
    - Extract route path from `request.route?.path` if available (handles dynamic routes like `/users/:id`).
    - Fallback: Sanitize URL by removing query params, replace UUID patterns with `:uuid`, replace pure numeric segments with `:id`.
    - This prevents "Cardinality Explosion" in the Map.
2. **Context Wrapping**:
    - Create `store = { cacheHits: 0, cacheMisses: 0 }`.
    - Use `profilingService.storage.run(store, () => next.handle().pipe(...))` to wrap the entire execution.
    - Capture the `store` reference inside the interceptor closure.
3. **Lifecycle Hooks**:
    - Measure `startTime = Date.now()`.
    - Use `tap` for success and `catchError` for failures.
    - In both cases, use `setImmediate` to call `recordProfile` with the captured `store` values to ensure data integrity.
4. **Exclusions**: Skip profiler for internal routes: `/v1`, `/v1/profiler*`, `/v1/profiler-ui*`.

### Phase 3: Cache Service Instrumentation

Modify the existing `AppCacheService` within `@core-shared-modules` to report activity.

1. **Implicit Reporting**: In the `get(key)` method:
    - After cache lookup, check if value exists.
    - Call `profilingService.recordCacheHit()` or `recordCacheMiss()`.
2. **Safety**: These calls should be "silent"—if context is missing, they log a warning but don't crash.

### Phase 4: API & Futuristic Dashboard

1. **Endpoints**:
    - `GET /profiler`: Returns `{ summary, profiles }`.
    - `GET /profiler/summary`: Returns summary statistics.
    - `GET /profiler/slow`: Returns slow endpoints.
    - `GET /profiler/errors`: Returns high error rate endpoints.
    - `POST /profiler/clear`: Clears all profiler data.
    - `GET /profiler-ui`: Serves standalone HTML dashboard.
    - `GET /profiler-ui/script.js`: Serves dashboard JavaScript.
2. **UI Design Specs**:
    - **Theme**: Dark Mode with Glassmorphism (`backdrop-filter: blur(10px)`).
    - **Color Palette**:
        - Cyan (`#00f2ff`) for interactive elements.
        - Magenta (`#ff00cc`) for P95 highlights.
        - Success Green (`#00ffa3`) for healthy status and cache hits.
        - Error Red (`#ff3366`) for errors and slow latency.
        - Warning Yellow (`#fbff00`).
    - **Layout**:
        - Header with logo "PROFILER_V2", status badge, last updated time.
        - Stats grid: Total Calls, Avg Latency, Slowest Trace, Cache Hit Rate.
        - Controls: Search input, Refresh and Clear buttons.
        - Table: Endpoint (with method badge), Calls, Min, Avg Latency (with progress bar), P95, Max, Cache (Hits/Misses), Status.
    - **Features**:
        - **Min/Avg/P95/Max Columns**: Show latency metrics.
        - **Cache Column**: Display `Hits / Misses` or `N/A`.
        - **Status Column**: Show healthy or error count.
        - **Live Filter**: Instant search on endpoints.
        - **Auto-Refresh**: Poll API every 5 seconds.
        - **Parallax Effect**: Subtle background movement on mouse move.

### Phase 5: Implementation Checklist

- [] Install/Verify `node:async_hooks` availability.
- [] Create `ProfilerService` in `libs/@oc/server-core/shared-modules/profiler/`.
- [] Export `ProfilerService` via `@core-shared-modules`.
- [] Create `ProfilerInterceptor` with path normalization regex.
- [] Instrument `AppCacheService`.
- [] Add `ProfilerController` with multiple endpoints.
- [] Implement HTML/JS dashboard with specified CSS and features.
- [] Verify exclusions and non-blocking updates.

---

This V2 prompt reflects the actual implemented features, including additional API endpoints, enhanced service methods, and detailed UI specifications.</content>
