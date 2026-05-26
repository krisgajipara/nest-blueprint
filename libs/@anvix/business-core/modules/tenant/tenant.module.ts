import { AuthRoleGuard, JwtAuthGuard, RoleGuard, TenantGuard } from "@core-custom-guards";
import { Tenant, TenantSubscriber, Token } from "@core-database";
import { AsyncContextService } from "@core-generic-services";
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantRepository } from "./tenant.repository";
import { TenantService } from "./tenant.service";

/**
 * Global Tenant Module
 * Provides all tenant-related services, guards, and repositories
 * Exported for use across the entire application
 */
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Tenant, Token])],
    providers: [
        AsyncContextService,
        TenantRepository,
        // Subscribers
        TenantSubscriber,

        // Services
        TenantService,

        // Guards
        AuthRoleGuard,
        JwtAuthGuard,
        RoleGuard,
        TenantGuard
    ],
    exports: [
        AsyncContextService,
        TenantRepository,
        TenantService,
        AuthRoleGuard,
        JwtAuthGuard,
        RoleGuard,
        TenantGuard,
        TypeOrmModule
    ]
})
export class TenantModule {}