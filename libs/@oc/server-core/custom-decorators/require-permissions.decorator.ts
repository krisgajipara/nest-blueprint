import { SetMetadata } from "@nestjs/common";

/**
 * Interface for permission requirement
 */
export interface PermissionRequirement {
    module: string;
    permission: string;
}

/**
 * Decorator to set required permissions for a route
 * Uses module and permission constants for type safety
 * @param requirements - Array of permission requirements with module and permission
 * @example @RequirePermissions([{ module: 'USER', permission: 'READ' }, { module: 'USER', permission: 'CREATE' }])
 */
export const RequirePermissions = (...requirements: PermissionRequirement[]) =>
    SetMetadata("requiredPermissions", requirements);
