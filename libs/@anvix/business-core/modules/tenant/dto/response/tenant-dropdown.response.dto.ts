import { Tenant } from "@core-database";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Response DTO for tenant dropdown data
 * Contains id, name for auto-complete and lazy loading, plus total count
 */
export class TenantDropdownResponseDto {
    /**
     * Constructor to map raw query result to dropdown response DTO
     * @param rawResult - Raw result from database query
     * @param total - Total count of tenants
     */
    constructor(rawResult: Tenant, total: number, cloudFrontUrl: string) {
        this.id = rawResult.id;
        this.name = rawResult.name;
        this.logo = rawResult.logo ? `${cloudFrontUrl}tenants/logos/${rawResult.logo}` : "";
        this.total = total;
    }

    @ApiProperty({
        description: "Entity's unique identifier",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "Entity record name",
        example: "Acme Corp"
    })
    name: string;

    @ApiProperty({
        description: "Tenant logo URL",
        example: "https://example.com/logo.png"
    })
    logo: string;

    @ApiProperty({
        description: "Total count of tenants",
        example: 50
    })
    total: number;

}
