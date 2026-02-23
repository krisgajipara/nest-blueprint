// cache/cache.module.ts
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { AppCacheService } from "./app-cache.service";

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true, // makes it available everywhere
            ttl: 60 * 60 * 1000, // 1h default TTL
            max: 100 // max number of items in cache
        })
    ],
    providers: [AppCacheService],
    exports: [AppCacheService]
})
export class AppCacheModule {}
