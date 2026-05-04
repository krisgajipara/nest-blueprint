import { AppCacheModule } from "@core-shared-modules";
import { Module } from "@nestjs/common";
import { TenantController } from "./tenant.controller";

@Module({
    imports: [AppCacheModule],
    controllers: [TenantController]
})
export class TenantModule {}
