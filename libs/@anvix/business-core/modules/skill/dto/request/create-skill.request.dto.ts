import { SkillEntityConstant } from "@core-constants";
import { ValidateMaxLength, ValidateNotEmpty, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class CreateSkillRequestDto {
    @ApiProperty({ description: "Skill name", example: "Hair Coloring" })
    @ValidateNotEmpty({ constraints: { field: "skill name" } })
    @ValidateType({ constraints: { field: "skill name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(SkillEntityConstant.NameMaxLength, { constraints: { field: "skill name" } })
    name: string;

    @ApiPropertyOptional({ description: "Description" })
    @ValidateOptional()
    @ValidateMaxLength(SkillEntityConstant.DescriptionMaxLength, { constraints: { field: "description" } })
    @ValidateType({ constraints: { field: "description", type: FieldTypeEnum.String } })
    description?: string;

    @ApiPropertyOptional({ description: "Active status", default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
