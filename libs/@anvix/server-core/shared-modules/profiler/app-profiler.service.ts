import { Injectable, Logger } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";

export interface ProfilerContext {
    cacheHits: number;
    cacheMisses: number;
}

export interface ApiProfile {
    endpoint: string;
    method: string;
    path: string;
    totalCalls: number;
    totalResponseTime: number; // in milliseconds
    averageResponseTime: number;
    p95ResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    lastCallAt: Date;
    errorCount: number;
    cacheHitCount: number;
    cacheMissCount: number;
    recentLatencies?: number[]; // Internal use for P95
}

@Injectable()
export class ProfilerService {
    readonly #logger = new Logger(ProfilerService.name);
    private readonly profiles = new Map<string, ApiProfile>();
    private readonly MAX_HISTORY = 100;
    private readonly storage = new AsyncLocalStorage<ProfilerContext>();

    /**
     * Wrap execution in a profiler context to track cache hits/misses
     */
    runWithContext<T>(fn: () => T | Promise<T>): T | Promise<T> {
        return this.storage.run({ cacheHits: 0, cacheMisses: 0 }, fn);
    }

    /**
     * Enter a profiler context for the current async execution branch
     */
    enterWithContext(): void {
        this.storage.enterWith({ cacheHits: 0, cacheMisses: 0 });
    }

    /**
     * Record a cache hit in the current context
     */
    recordCacheHit(): void {
        const store = this.storage.getStore();
        if (store) {
            store.cacheHits++;
            this.#logger.debug(`Context found: incremented cacheHits to ${store.cacheHits}`);
        } else {
            this.#logger.warn("Context NOT found during recordCacheHit");
        }
    }

    /**
     * Record a cache miss in the current context
     */
    recordCacheMiss(): void {
        const store = this.storage.getStore();
        if (store) {
            store.cacheMisses++;
            this.#logger.debug(`Context found: incremented cacheMisses to ${store.cacheMisses}`);
        } else {
            this.#logger.warn("Context NOT found during recordCacheMiss");
        }
    }

    /**
     * Record a profiler measurement for an API call
     */
    recordProfile(
        endpoint: string,
        method: string,
        path: string,
        responseTime: number,
        isError: boolean = false,
        cacheHits: number = 0,
        cacheMisses: number = 0
    ): void {
        const safeHits = cacheHits || 0;
        const safeMisses = cacheMisses || 0;

        let profile = this.profiles.get(endpoint);

        if (!profile) {
            profile = {
                endpoint,
                method,
                path,
                totalCalls: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                p95ResponseTime: 0,
                minResponseTime: responseTime,
                maxResponseTime: responseTime,
                lastCallAt: new Date(),
                errorCount: 0,
                cacheHitCount: 0,
                cacheMissCount: 0,
                recentLatencies: []
            };
            this.profiles.set(endpoint, profile);
        }

        // Update profile statistics
        profile.totalCalls++;
        profile.totalResponseTime += responseTime;
        profile.averageResponseTime = profile.totalResponseTime / profile.totalCalls;
        profile.minResponseTime = Math.min(profile.minResponseTime, responseTime);
        profile.maxResponseTime = Math.max(profile.maxResponseTime, responseTime);
        profile.lastCallAt = new Date();
        profile.cacheHitCount += safeHits;
        profile.cacheMissCount += safeMisses;

        this.#logger.debug(
            `[ProfilerV3] Recorded ${endpoint}: hits=${safeHits}, misses=${safeMisses}, totalHits=${profile.cacheHitCount}`
        );

        if (isError) {
            profile.errorCount++;
        }

        // Update P95 history
        if (profile.recentLatencies) {
            profile.recentLatencies.push(responseTime);
            if (profile.recentLatencies.length > this.MAX_HISTORY) {
                profile.recentLatencies.shift();
            }

            // Re-calculate P95 periodically or on every call if history is small
            const sorted = [...profile.recentLatencies].sort((a, b) => a - b);
            const index = Math.floor(sorted.length * 0.95);
            profile.p95ResponseTime = sorted[index] || responseTime;
        }

        // Log slow requests (>1000ms)
        if (responseTime > 1000) {
            this.#logger.warn(`Slow API call: ${endpoint} took ${responseTime}ms`);
        }
    }

    /**
     * Get all profiler data
     */
    getAllProfiles(): ApiProfile[] {
        return Array.from(this.profiles.values())
            .map((p) => {
                // Remove internal history before sending to client
                const rest = { ...p };
                delete rest.recentLatencies;
                return rest;
            })
            .sort((a, b) => b.averageResponseTime - a.averageResponseTime);
    }

    /**
     * Get profiler data for a specific endpoint
     */
    getProfile(endpoint: string): Omit<ApiProfile, "recentLatencies"> | undefined {
        const profile = this.profiles.get(endpoint);
        if (!profile) return undefined;
        const rest = { ...profile };
        delete rest.recentLatencies;
        return rest;
    }

    /**
     * Get profiler summary statistics
     */
    getSummary(): {
        totalEndpoints: number;
        totalCalls: number;
        totalCacheHits: number;
        totalCacheMisses: number;
        averageResponseTime: number;
        slowestEndpoint: Omit<ApiProfile, "recentLatencies"> | null;
        fastestEndpoint: Omit<ApiProfile, "recentLatencies"> | null;
    } {
        const allProfiles = Array.from(this.profiles.values());

        if (allProfiles.length === 0) {
            return {
                totalEndpoints: 0,
                totalCalls: 0,
                totalCacheHits: 0,
                totalCacheMisses: 0,
                averageResponseTime: 0,
                slowestEndpoint: null,
                fastestEndpoint: null
            };
        }

        let totalCalls = 0;
        let totalWeightedTime = 0;
        let totalCacheHits = 0;
        let totalCacheMisses = 0;
        let slowest = allProfiles[0];
        let fastest = allProfiles[0];

        for (const p of allProfiles) {
            totalCalls += p.totalCalls;
            totalWeightedTime += p.totalResponseTime;
            totalCacheHits += p.cacheHitCount;
            totalCacheMisses += p.cacheMissCount;
            if (p.averageResponseTime > slowest.averageResponseTime) slowest = p;
            if (p.averageResponseTime < fastest.averageResponseTime) fastest = p;
        }

        const slowestRest = { ...slowest };
        delete slowestRest.recentLatencies;
        const fastestRest = { ...fastest };
        delete fastestRest.recentLatencies;

        return {
            totalEndpoints: allProfiles.length,
            totalCalls,
            totalCacheHits,
            totalCacheMisses,
            averageResponseTime: totalCalls > 0 ? Math.round((totalWeightedTime / totalCalls) * 100) / 100 : 0,
            slowestEndpoint: slowestRest,
            fastestEndpoint: fastestRest
        };
    }

    /**
     * Clear all profiler data
     */
    clearAllProfiles(): void {
        this.profiles.clear();
        this.#logger.log("All profiler data cleared");
    }

    /**
     * Get current context if any
     */
    getContext(): ProfilerContext | undefined {
        return this.storage.getStore();
    }

    /**
     * Get endpoints with high error rates (>5% errors)
     */
    getHighErrorRateEndpoints(): ApiProfile[] {
        return this.getAllProfiles().filter((profile) => {
            const errorRate = profile.errorCount / profile.totalCalls;
            return errorRate > 0.05 && profile.totalCalls > 10;
        }) as ApiProfile[];
    }

    /**
     * Get slow endpoints (average >500ms)
     */
    getSlowEndpoints(): ApiProfile[] {
        return this.getAllProfiles().filter((profile) => profile.averageResponseTime > 500) as ApiProfile[];
    }
}
