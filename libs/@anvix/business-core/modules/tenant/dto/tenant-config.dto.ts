import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    ValidateOptional,
    ValidateType,
    ValidateMaxLength
} from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import type { ITenantConfig, ITenantFeatureFlags, ITenantMetadata, ITenantTheme } from "@core-interfaces";

/**
 * Theme-specific configuration that tenants can override to customize branding.
 */
export class TenantThemeDto implements ITenantTheme {
    @ApiPropertyOptional({
        description: "Primary brand color (hex, rgb, etc.)",
        example: "#1f2937"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "primaryColor", type: FieldTypeEnum.String } })
    @ValidateMaxLength(64, { constraints: { field: "primaryColor" } })
    primaryColor?: string;

    @ApiPropertyOptional({
        description: "URL to the tenant-specific background or hero image",
        example: "https://cdn.example.com/background.png"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "backgroundImageUrl", type: FieldTypeEnum.String } })
    @ValidateMaxLength(1024, { constraints: { field: "backgroundImageUrl" } })
    backgroundImageUrl?: string;
}

/**
 * Locale and timezone for the tenant.
 */
export class TenantMetadataDto implements ITenantMetadata {
    @ApiPropertyOptional({ description: "Default locale", example: "en" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "locale", type: FieldTypeEnum.String } })
    @ValidateMaxLength(16, { constraints: { field: "locale" } })
    locale?: string;

    @ApiPropertyOptional({ description: "IANA timezone", example: "UTC" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "timezone", type: FieldTypeEnum.String } })
    @ValidateMaxLength(64, { constraints: { field: "timezone" } })
    timezone?: string;
}

/**
 * Feature toggles enabled for the tenant.
 */
export class TenantFeatureFlagsDto implements ITenantFeatureFlags {
    @ApiPropertyOptional({ description: "Whether SSO login is enabled", example: false })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "enableSso", type: FieldTypeEnum.Boolean } })
    enableSso?: boolean;
}

/**
 * Tenant configuration payload used during tenant creation/update.
 * Stored as jsonb on `tenant.config`.
 */
export class TenantConfigDto implements ITenantConfig {
    @ApiPropertyOptional({
        description: "Theme overrides for the tenant",
        type: TenantThemeDto,
        example: { primaryColor: "#1f2937" }
    })
    @ValidateOptional()
    theme?: TenantThemeDto;

    @ApiPropertyOptional({
        description: "Locale and timezone",
        type: TenantMetadataDto,
        example: { locale: "en", timezone: "UTC" }
    })
    @ValidateOptional()
    metadata?: TenantMetadataDto;

    @ApiPropertyOptional({
        description: "Feature toggles for the tenant",
        type: TenantFeatureFlagsDto,
        example: { enableSso: false }
    })
    @ValidateOptional()
    featureFlags?: TenantFeatureFlagsDto;
}
