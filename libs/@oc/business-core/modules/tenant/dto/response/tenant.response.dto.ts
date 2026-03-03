import { ApiProperty } from "@nestjs/swagger";
import { TenantStatus } from "@core-enums";
import { Tenant } from "@core-database";

/**
 * Response DTO for full tenant data
 */
export class TenantResponseDto {
    /**
     * Constructor to map Tenant entity to response DTO
     * @param tenant - Tenant entity from repository
     */
    constructor(tenant: Tenant) {
        this.id = tenant.id;
        this.name = tenant.name;
        this.subdomain = tenant.subdomain;
        this.config = tenant.config;
        this.logo = tenant.logo;
        this.status = tenant.status;
        this.createdAt = tenant.createdAt;
        this.updatedAt = tenant.updatedAt;
    }

    @ApiProperty({
        description: "Tenant unique identifier",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "Tenant name",
        example: "Acme Corp"
    })
    name: string;

    @ApiProperty({
        description: "Tenant subdomain",
        example: "acme"
    })
    subdomain: string;

    @ApiProperty({
        description: "Tenant configuration (theme, colors, etc.)",
        type: Object
    })
    config: any;

    @ApiProperty({
        description: "Tenant logo URL",
        example: "https://.../logo.png",
        required: false
    })
    logo: string;

    @ApiProperty({
        description: "Tenant status",
        example: TenantStatus.ACTIVE,
        enum: TenantStatus
    })
    status: TenantStatus;

    @ApiProperty({
        description: "Creation timestamp",
        example: "2023-01-01T00:00:00.000Z"
    })
    createdAt: Date;

    @ApiProperty({
        description: "Last update timestamp",
        example: "2023-01-01T00:00:00.000Z"
    })
    updatedAt: Date;
}
