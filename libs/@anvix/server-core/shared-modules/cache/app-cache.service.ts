// cache/cache.service.ts

import { GenerateLogPrefix } from "@core-utilities";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Cache } from "cache-manager";
import { ProfilerService } from "../profiler/app-profiler.service";

@Injectable()
export class AppCacheService {
    private readonly logger: Logger = new Logger(AppCacheService.name);
    private readonly listCacheKeys = new Map<string, Set<string>>(); // module -> set of list cache keys

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
        private readonly profilingService: ProfilerService
    ) {}

    async get<T>(key: string): Promise<T | undefined> {
        const logPrefix = GenerateLogPrefix(this.get.name);
        this.logger.debug(`${logPrefix} : Getting cache - ${key}`);

        try {
            const value = await this.cache.get<T>(key);
            if (value !== undefined) {
                this.profilingService.recordCacheHit();
            } else {
                this.profilingService.recordCacheMiss();
            }
            return value;
        } catch (error) {
            this.logger.error(`${logPrefix} : Error while getting cache - ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async set<T>(key: string, value: T, ttl = 360, registerAsListCache?: { module: string }): Promise<void> {
        const logPrefix = GenerateLogPrefix(this.set.name);
        this.logger.debug(`${logPrefix} : Setting cache - ${key}`);
        this.logger.debug(`${logPrefix} : Value - ${value}`);
        this.logger.debug(`${logPrefix} : TTL - ${ttl}`);

        try {
            await this.cache.set(key, value, ttl * 1000 * 60);

            // Register as list cache if specified
            if (registerAsListCache) {
                this.registerListCacheKey(registerAsListCache.module, key);
            }
        } catch (error) {
            this.logger.error(`${logPrefix} : Error while setting cache - ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async del(key: string): Promise<void> {
        const logPrefix = GenerateLogPrefix(this.del.name);
        this.logger.debug(`${logPrefix} : Deleting cache - ${key}`);

        try {
            await this.cache.del(key);
        } catch (error) {
            this.logger.error(`${logPrefix} : Error while deleting cache - ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async clear(): Promise<void> {
        const logPrefix = GenerateLogPrefix(this.clear.name);

        try {
            //  this method can be extended to clear all cache if needed
            await this.cache.clear();
            this.logger.warn(`${logPrefix} : Clear cache method called - implement cache clearing logic if needed`);
        } catch (error) {
            this.logger.error(`${logPrefix} : Error while clearing cache - ${JSON.stringify(error)}`);
            throw error;
        }
    }

    registerListCacheKey(module: string, key: string): void {
        if (!this.listCacheKeys.has(module)) {
            this.listCacheKeys.set(module, new Set());
        }
        this.listCacheKeys.get(module)!.add(key);
    }

    async clearListCachesByModule(module: string): Promise<void> {
        const logPrefix = GenerateLogPrefix(this.clearListCachesByModule.name);

        try {
            const moduleKeys = this.listCacheKeys.get(module);
            if (moduleKeys && moduleKeys.size > 0) {
                await Promise.all(Array.from(moduleKeys).map((key) => this.del(key)));
                moduleKeys.clear();
                this.logger.debug(`${logPrefix} : Cleared ${moduleKeys.size} list cache keys for module ${module}`);
            }
        } catch (error) {
            this.logger.error(`${logPrefix} : Error while clearing list caches by module - ${error}`);
            throw error;
        }
    }
}
