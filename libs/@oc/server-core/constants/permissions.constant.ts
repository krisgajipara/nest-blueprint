
/**
 * Module constants for permission system
 */
export const MODULE_CONSTANTS = {
    USER: "User",
    AUTH: "Auth",
    ROLE: "Role",
} as const;

export const DEFAULT_MODULE_CONSTANTS = {
    USER: "User",
    ROLE: "Role",
} as const;

/**
 * Generic permission constants (applicable to all modules)
 */
export const PERMISSION_CONSTANTS = {
    READ: "read",
    WRITE: "write",
    EDIT: "edit",
    DELETE: "delete"
} as const;

// Placeholders for removed RolePermission type to prevent immediate build break if referenced as type
export type Permission = any;
export type RolePermission = any;

export const DEFAULT_PERMISSIONS: RolePermission[] = [{
    module: MODULE_CONSTANTS.USER,
    permissions: {
        read: true,
        write: true,
        edit: true,
        delete: true
    }
},
{
    module: MODULE_CONSTANTS.ROLE,
    permissions: {
        read: true,
        write: true,
        edit: true,
        delete: true
    }
}]

/**
 * Get default permissions for a specific module
 * @param moduleName - Name of the module
 * @returns Default permissions for the module or null if not found
 */
export function getDefaultModulePermissions(moduleName: string): any | null {
    return null;
}

/**
 * Get all available modules
 * @returns Array of module names
 */
export function getAvailableModules(): string[] {
    return Object.values(DEFAULT_MODULE_CONSTANTS);
}
