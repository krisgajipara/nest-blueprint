import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppCacheModule } from "../cache/app-cache.module";
import { AppPermissionService } from "./app-permission.service";

/**
 * Permission Module
 * Provides permission checking operations across the application
 */
@Module({
    imports: [ConfigModule, AppCacheModule, TypeOrmModule.forFeature([])],
    providers: [AppPermissionService],
    exports: [AppPermissionService]
})
export class AppPermissionModule { }