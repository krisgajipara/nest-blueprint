import { SkillEntityConstant } from "@core-constants";
import { ValidateMaxLength, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSkillRequestDto {
    @ApiPropertyOptional({ description: "Skill name" })
    @ValidateOptional()
    @ValidateMaxLength(SkillEntityConstant.NameMaxLength, { constraints: { field: "skill name" } })
    @ValidateType({ constraints: { field: "skill name", type: FieldTypeEnum.String } })
    name?: string;

    @ApiPropertyOptional({ description: "Description" })
    @ValidateOptional()
    @ValidateMaxLength(SkillEntityConstant.DescriptionMaxLength, { constraints: { field: "description" } })
    @ValidateType({ constraints: { field: "description", type: FieldTypeEnum.String } })
    description?: string;

    @ApiPropertyOptional({ description: "Active status" })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
