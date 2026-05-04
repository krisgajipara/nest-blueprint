import { AuthRoleGuard } from "@core-custom-guards";
import { Tenant, TenantSubscriber, Token } from "@core-database";
import { AsyncContextService } from "@core-generic-services";
import { RequestContextService } from "@core-shared-modules";
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
        RequestContextService,
        TenantRepository,
        // Subscribers
        TenantSubscriber,

        // Services
        TenantService,

        // Guards
        AuthRoleGuard
    ],
    exports: [
        AsyncContextService,
        RequestContextService,
        TenantRepository,
        TenantService,
        AuthRoleGuard,
        TypeOrmModule
    ]
})
export class TenantModule {}