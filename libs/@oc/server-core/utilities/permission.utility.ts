import { PermissionRequirement } from "@core-custom-decorators";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Permission, Role, RolePermission } from "../database/entities/role.entity";
import { AppCacheService } from "../shared-modules/cache/app-cache.service";
import { GetCacheKey } from "./cache.utility";

/**
 * Common permission checking utility functions
 * Used by AuthGuard and other components for permission validation
 */
@Injectable()
export class PermissionUtility {
    private static readonly ROLE_CACHE_TTL = 300; // 5 minutes
    private static readonly ROLE_CACHE_MODULE = "role";

    constructor(
        private readonly appCacheService: AppCacheService,
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}
    /**
     * Check if a user role has the required permissions
     * @param userRole - User's role object with permissions array
     * @param requiredPermissions - Array of required permission objects
     * @returns boolean - true if user has all required permissions
     */
    async hasPermissions(roleId: string, requiredPermissions: PermissionRequirement[]): Promise<boolean> {
        // Generate cache key for the role
        const cacheKey = GetCacheKey(PermissionUtility.ROLE_CACHE_MODULE, roleId);

        // Check cache first for the role
        let roleFromCache = await this.appCacheService.get<Role>(cacheKey);

        // If not in cache, fetch from database
        if (!roleFromCache) {
            roleFromCache = await this.dataSource.getRepository(Role).findOne({ where: { id: roleId } });

            // Cache the role if found (TTL: 5 minutes)
            if (roleFromCache) {
                await this.appCacheService.set(cacheKey, roleFromCache, PermissionUtility.ROLE_CACHE_TTL);
            }
        }

        // Use cached/fetched role for permission check
        const userRole = roleFromCache;

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
