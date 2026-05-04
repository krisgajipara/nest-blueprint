import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional, ValidateType } from "@core-custom-validators";
import { TenantStatus, FieldTypeEnum } from "@core-enums";

/**
 * DTO for listing tenants with search, filter, pagination, and sorting
 */
export class ListTenantRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "Filter by tenant status",
        example: TenantStatus.ACTIVE,
        enum: TenantStatus
    })
    @ValidateOptional()
    @ValidateEnumType(TenantStatus, { constraints: { field: "status" } })
    status?: TenantStatus;

    @ApiPropertyOptional({
        description: "Sort by field",
        example: "createdAt",
        enum: ["name", "subdomain", "status", "createdAt"]
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "sort by", type: FieldTypeEnum.String } })
    sortBy?: string;
}
