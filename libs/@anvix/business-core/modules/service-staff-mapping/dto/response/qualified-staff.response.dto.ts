import { ServiceStaffMapping } from "@core-database";
import { StaffSkillLevelEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Staff eligible for booking a service (active mapping + active staff)
 */
export class QualifiedStaffResponseDto {
    @ApiProperty({ description: "Staff user ID" })
    staffId: string;

    @ApiProperty({ description: "Staff full name" })
    staffName: string;

    @ApiProperty({ description: "Skill level", enum: StaffSkillLevelEnum })
    skillLevel: StaffSkillLevelEnum;

    constructor(mapping: ServiceStaffMapping) {
        this.staffId = mapping.staffId;
        this.skillLevel = mapping.skillLevel;
        const staff = mapping.staff;
        this.staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : "";
    }
}
