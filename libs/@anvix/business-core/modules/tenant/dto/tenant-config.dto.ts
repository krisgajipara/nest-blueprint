import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    ValidateOptional,
    ValidateType,
    ValidateMaxLength
} from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

/**
 * Theme-specific configuration that tenants can override to customize branding.
 */
export class TenantThemeDto {
    @ApiPropertyOptional({
        description: "Primary brand color (hex, rgb, etc.)",
        example: "#1f2937"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "primaryColor", type: FieldTypeEnum.String } })
    @ValidateMaxLength(64, { constraints: { field: "primaryColor" } })
    primaryColor?: string;

    @ApiPropertyOptional({
        description: "Secondary brand color used for accents/interactions",
        example: "#3b82f6"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "secondaryColor", type: FieldTypeEnum.String } })
    @ValidateMaxLength(64, { constraints: { field: "secondaryColor" } })
    secondaryColor?: string;

    @ApiPropertyOptional({
        description: "Text color that contrasts with the brand background",
        example: "#ffffff"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "textColor", type: FieldTypeEnum.String } })
    @ValidateMaxLength(64, { constraints: { field: "textColor" } })
    textColor?: string;

    @ApiPropertyOptional({
        description: "URL to the tenant-specific background or hero image",
        example: "https://cdn.example.com/background.png"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "backgroundImageUrl", type: FieldTypeEnum.String } })
    @ValidateMaxLength(1024, { constraints: { field: "backgroundImageUrl" } })
    backgroundImageUrl?: string;

    @ApiPropertyOptional({
        description: "Font family override for tenant branding",
        example: "Inter, system-ui, sans-serif"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "fontFamily", type: FieldTypeEnum.String } })
    @ValidateMaxLength(256, { constraints: { field: "fontFamily" } })
    fontFamily?: string;
}

/**
 * Tenant configuration payload used during tenant creation/update.
 * The payload is stored as JSON and can contain dynamic fields such as theme settings, feature toggles, etc.
 */
export class TenantConfigDto {
    @ApiPropertyOptional({
        description: "Theme overrides (colors, fonts, backgrounds) for the tenant",
        type: TenantThemeDto
    })
    @ValidateOptional()
    theme?: TenantThemeDto;

    @ApiPropertyOptional({
        description: "Custom metadata or dynamic fields saved per tenant",
        type: "object",
        additionalProperties: true,
        example: { locale: "en", timezone: "Asia/Kolkata" }
    })
    @ValidateOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: "Feature toggles and capabilities enabled for the tenant",
        type: "object",
        additionalProperties: true,
        example: { enableSso: true, maxProjects: 20 }
    })
    @ValidateOptional()
    featureFlags?: Record<string, boolean | number | string>;
}
