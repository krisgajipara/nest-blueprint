import { ValidateEnumType, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, StaffSkillLevelEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateServiceStaffMappingRequestDto {
    @ApiPropertyOptional({ description: "Skill level", enum: StaffSkillLevelEnum })
    @ValidateOptional()
    @ValidateEnumType(StaffSkillLevelEnum, { constraints: { field: "skill level" } })
    skillLevel?: StaffSkillLevelEnum;

    @ApiPropertyOptional({ description: "Assignment active status", example: true })
    @IsOptional()
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.Boolean } })
    isActive?: boolean;
}
