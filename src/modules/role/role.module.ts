import { RoleRepository, RoleService } from "@business-core-modules";
import { Role } from "@core-database";
import { AppCacheModule, AppPermissionModule, AppPermissionService } from "@core-shared-modules";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { RoleController } from "./role.controller";

/**
 * Role management module
 * Simplified approach with JSON permissions in role table
 */
@Module({
    imports: [TypeOrmModule.forFeature([Role]), AppCacheModule, UserModule, AppPermissionModule],
    controllers: [RoleController],
    providers: [RoleService, RoleRepository, AppPermissionService],
    exports: [RoleService]
})
export class RoleModule { }
