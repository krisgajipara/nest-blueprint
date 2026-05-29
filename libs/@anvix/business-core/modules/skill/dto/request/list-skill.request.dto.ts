import { CommonSearchRequestDto } from "@business-core-dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ListSkillRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({ description: "Filter by active status" })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Sort by field",
        enum: ["name", "createdAt", "updatedAt"]
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
