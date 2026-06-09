import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

/**
 * DTO for listing roles with search, filter, pagination, and sorting
 */
export class ListRoleRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "Sort by field",
        example: "name",
        enum: ["name", "description", "createdAt", "updatedAt"]
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "sort by", type: FieldTypeEnum.String } })
    sortBy?: string;
}
