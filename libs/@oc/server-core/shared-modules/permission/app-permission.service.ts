import { PermissionRequirement } from "@core-custom-decorators";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Permission, Role, RolePermission } from "../../database/entities/role.entity";
import { AppCacheService } from "../cache/app-cache.service";
import { GetCacheKey } from "../../utilities/cache.utility";

/**
 * Permission service for checking user permissions
 * Handles permission validation with caching
 */
@Injectable()
export class AppPermissionService {
    private static readonly ROLE_CACHE_TTL = 300; // 5 minutes
    private static readonly ROLE_CACHE_MODULE = "role";

    constructor(
        private readonly appCacheService: AppCacheService,
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) { }

    /**
     * Check if a user role has the required permissions
     * @param id - Role ID
     * @param requiredPermissions - Array of required permission objects
     * @returns boolean - true if user has all required permissions
     */
    async hasPermissions(id: string, requiredPermissions: PermissionRequirement[]): Promise<boolean> {
        // Generate cache key for the role
        const cacheKey = GetCacheKey(AppPermissionService.ROLE_CACHE_MODULE, id);

        // Check cache first
        let userRole = await this.appCacheService.get<Role>(cacheKey);

        if (!userRole) {
            // Fetch the user role from the database
            userRole = await this.dataSource.getRepository(Role).findOne({ where: { id } });

            // Cache the role if found
            if (userRole) {
                await this.appCacheService.set(cacheKey, userRole, AppPermissionService.ROLE_CACHE_TTL);
            }
        }

        // If role not found or no permissions array, deny access
        if (!userRole?.permissions || !Array.isArray(userRole.permissions)) {
            return false;
        }

        // If no permissions required, allow access
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // Check each required permission
        for (const required of requiredPermissions) {
            const hasPermission = userRole.permissions.some((modulePerm: RolePermission) => {
                return (
                    modulePerm.module === required.module &&
                    modulePerm.permissions[required.permission as keyof Permission] === true
                );
            });

            if (!hasPermission) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has specific permission for a module
     * @param userRole - User's role object with permissions array
     * @param module - Module name
     * @param permission - Permission name (read/write/edit/delete)
     * @returns boolean - true if user has the permission
     */
    hasPermission(
        userRole: { id: string; name: string; permissions: RolePermission[] },
        module: string,
        permission: string
    ): boolean {
        if (!userRole.permissions || !Array.isArray(userRole.permissions)) {
            return false;
        }

        return userRole.permissions.some((modulePerm: RolePermission) => {
            return modulePerm.module === module && modulePerm.permissions[permission as keyof Permission] === true;
        });
    }
}