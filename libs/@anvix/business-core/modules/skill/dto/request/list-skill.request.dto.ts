import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ListSkillRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({ description: "Filter by active status" })
    @IsOptional()
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.BooleanString } })
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Sort by field",
        enum: ["name", "createdAt", "updatedAt"]
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
