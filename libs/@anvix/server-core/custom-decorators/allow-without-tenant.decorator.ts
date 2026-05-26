import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key: when true, the global TenantGuard skips tenant header validation.
 */
export const ALLOW_WITHOUT_TENANT_KEY = "allowWithoutTenant";

/**
 * Marks a route or controller as exempt from tenant header requirements.
 * Use for public/bootstrap endpoints (health, auth login, profiler, etc.).
 */
export const AllowWithoutTenant = () => SetMetadata(ALLOW_WITHOUT_TENANT_KEY, true);

/**
 * Alias for tenant-module routes that operate without tenant context
 * (e.g. product-owner tenant onboarding and cross-tenant admin APIs).
 */
export const TenantApi = () => SetMetadata(ALLOW_WITHOUT_TENANT_KEY, true);
