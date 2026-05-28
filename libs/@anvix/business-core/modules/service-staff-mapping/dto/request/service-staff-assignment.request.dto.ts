import { ValidateEnumType, ValidateNotEmpty } from "@core-custom-validators";
import { StaffSkillLevelEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsUUID, ValidateNested } from "class-validator";

export class ServiceStaffAssignmentItemDto {
    @ApiProperty({ description: "Staff user ID" })
    @ValidateNotEmpty({ constraints: { field: "staff" } })
    @IsUUID()
    staffId: string;

    @ApiProperty({ description: "Skill level", enum: StaffSkillLevelEnum, example: StaffSkillLevelEnum.SENIOR })
    @ValidateEnumType(StaffSkillLevelEnum, { constraints: { field: "skill level" } })
    skillLevel: StaffSkillLevelEnum;

    @ApiPropertyOptional({ description: "Assignment active status", example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class AssignServiceStaffRequestDto {
    @ApiProperty({ description: "Staff assignments for the service", type: [ServiceStaffAssignmentItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceStaffAssignmentItemDto)
    assignments: ServiceStaffAssignmentItemDto[];
}
