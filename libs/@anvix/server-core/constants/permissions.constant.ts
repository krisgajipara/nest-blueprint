/**
 * Module constants for permission system
 */
export const MODULE_CONSTANTS = {
    USER: "User",
    AUTH: "Auth",
    ROLE: "Role",
    TENANT: "Tenant",
    SERVICE_CATEGORY: "ServiceCategory",
    SERVICE: "Service",
    STYLIST: "Stylist",
    SKILL: "Skill"
} as const;

/** Modules exposed in salon-admin role management (tenant module is platform-only) */
export const SALON_ROLE_MODULE_CONSTANTS = {
    USER: "User",
    ROLE: "Role",
    SERVICE_CATEGORY: "ServiceCategory",
    SERVICE: "Service",
    STYLIST: "Stylist",
    SKILL: "Skill"
} as const;

export const DEFAULT_MODULE_CONSTANTS = {
    USER: "User",
    ROLE: "Role"
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

export const DEFAULT_PERMISSIONS: RolePermission[] = [
    {
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
    },
    {
        module: MODULE_CONSTANTS.SERVICE_CATEGORY,
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true
        }
    },
    {
        module: MODULE_CONSTANTS.SERVICE,
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true
        }
    },
    {
        module: MODULE_CONSTANTS.STYLIST,
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true
        }
    },
    {
        module: MODULE_CONSTANTS.SKILL,
        permissions: {
            read: true,
            write: true,
            edit: true,
            delete: true
        }
    }
];

/**
 * Modules assignable via salon-admin role management UI
 */
export function getSalonRoleModules(): string[] {
    return Object.values(SALON_ROLE_MODULE_CONSTANTS);
}

/**
 * Strips platform-only modules (e.g. Tenant) from role permission payloads
 */
export function filterSalonRolePermissions(permissions: RolePermission[]): RolePermission[] {
    if (!permissions?.length) {
        return [];
    }

    const allowedModules = new Set<string>(Object.values(SALON_ROLE_MODULE_CONSTANTS));
    return permissions.filter((entry) => entry?.module && allowedModules.has(entry.module));
}

/**
 * Get all available modules for salon role management
 * @returns Array of module names
 */
export function getAvailableModules(): string[] {
    return getSalonRoleModules();
}
