import { ApiProperty } from "@nestjs/swagger";
import { Tenant } from "@core-database";
import type { ITenantConfig } from "@core-interfaces";
import { TenantConfigDto } from "../tenant-config.dto";

/**
 * Public response DTO for tenant resolution by subdomain
 */
export class TenantPublicResponseDto {
    /**
     * Constructor to map Tenant entity to public response DTO
     * @param tenant - Tenant entity or partial data
     */
    constructor(tenant?: Tenant | Partial<TenantPublicResponseDto>) {
        if (tenant) {
            this.id = (tenant as Tenant).id;
            this.name = (tenant as Tenant).name;
            this.subdomain = (tenant as Tenant).subdomain;
            this.config = (tenant as Tenant).config;
            this.logo = (tenant as Tenant).logo;
            this.isProductOwner = (tenant as Partial<TenantPublicResponseDto>).isProductOwner || false;
        }
    }

    @ApiProperty({
        description: "Tenant unique identifier",
        example: "123e4567-e89b-12d3-a456-426614174000",
        required: false
    })
    id?: string;

    @ApiProperty({
        description: "Tenant name",
        example: "Acme Corp",
        required: false
    })
    name?: string;

    @ApiProperty({
        description: "Tenant subdomain",
        example: "acme",
        required: false
    })
    subdomain?: string;

    @ApiProperty({
        description: "Tenant configuration (theme, metadata, feature flags)",
        type: TenantConfigDto,
        required: false
    })
    config?: ITenantConfig;

    @ApiProperty({
        description: "Tenant logo URL",
        example: "https://.../logo.png",
        required: false
    })
    logo?: string;

    @ApiProperty({
        description: "Flag indicating if the context is Product Owner (no specific tenant)",
        example: false,
        required: false
    })
    isProductOwner?: boolean;
}
