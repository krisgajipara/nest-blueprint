/**
 * Theme overrides stored in `tenant.config` (jsonb).
 */
export interface ITenantTheme {
    primaryColor?: string;
    backgroundImageUrl?: string;
}

/**
 * Tenant locale and timezone settings.
 */
export interface ITenantMetadata {
    locale?: string;
    timezone?: string;
}

/**
 * Feature toggles for the tenant.
 */
export interface ITenantFeatureFlags {
    enableSso?: boolean;
}

/**
 * JSON shape of `tenant.config` (jsonb).
 */
export interface ITenantConfig {
    theme?: ITenantTheme;
    metadata?: ITenantMetadata;
    featureFlags?: ITenantFeatureFlags;
}
