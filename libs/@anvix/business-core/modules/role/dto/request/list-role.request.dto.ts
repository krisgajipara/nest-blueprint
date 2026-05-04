import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CommonSearchRequestDto } from "@business-core-dto";

/**
 * DTO for listing roles with search, filter, pagination, and sorting
 */
export class ListRoleRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "Sort by field",
        example: "name",
        enum: ["name", "description", "createdAt", "updatedAt"]
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
