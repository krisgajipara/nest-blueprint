/**
 * Cache key constants for application-wide caching
 */
export const CacheKeyConstant = {
    
    TenantValidationValidTTL: 3600, // 1 hour
    TenantValidationInvalidTTL: 60, // 1 minute (DoS prevention)

    // General cache TTL
    DefaultTTL: 360, // 6 minutes

    // Permission cache TTL
    RolePermissionTTL: 300 // 5 minutes
};

export const CacheModulePrefix = {
    User: "User:",
    Auth: "Auth:",
    Role: "Role:",
    Tenant: "Tenant:"
};
