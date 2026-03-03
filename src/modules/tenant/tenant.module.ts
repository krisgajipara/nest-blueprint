import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "@core-database";
import { TenantRepository, TenantService, TenantSeedingService } from "@business-core-modules";
import { PermissionUtility, S3Utility } from "@core-utilities";
import { AppCacheModule } from "@core-shared-modules";
import { TenantController } from "./tenant.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Tenant]), AppCacheModule],
    controllers: [TenantController],
    providers: [TenantRepository, TenantService, TenantSeedingService, PermissionUtility, S3Utility],
    exports: [TenantService]
})
export class TenantModule {}
