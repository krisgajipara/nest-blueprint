import { ValidateEnumType, ValidateOptional } from "@core-custom-validators";
import { StaffSkillLevelEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateServiceStaffMappingRequestDto {
    @ApiPropertyOptional({ description: "Skill level", enum: StaffSkillLevelEnum })
    @ValidateOptional()
    @ValidateEnumType(StaffSkillLevelEnum, { constraints: { field: "skill level" } })
    skillLevel?: StaffSkillLevelEnum;

    @ApiPropertyOptional({ description: "Assignment active status", example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
