import { ApiProperty } from "@nestjs/swagger";

/**
 * Interface for raw dropdown tenant result from database query
 */
export interface TenantDropdownRawResult {
    tenant_id: string;
    tenant_name: string;
    totalInReviewAssessmentCycles: string;
}

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
    constructor(rawResult: TenantDropdownRawResult, total: number) {
        this.id = rawResult.tenant_id;
        this.name = rawResult.tenant_name;
        this.total = total;
        this.totalInReviewAssessmentCycles = parseInt(rawResult.totalInReviewAssessmentCycles) || 0;
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
        description: "Total count of tenants",
        example: 50
    })
    total: number;

    @ApiProperty({
        description: "Total count of in-review assessment cycles",
        example: 5
    })
    totalInReviewAssessmentCycles: number;
}
