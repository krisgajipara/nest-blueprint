import { ServiceStaffMapping } from "@core-database";
import { StaffSkillLevelEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Compact staff assignment summary for service list/detail responses.
 */
export class AssignedStaffSummaryDto {
    @ApiProperty({ description: "Stylist user ID" })
    staffId: string;

    @ApiProperty({ description: "Stylist full name", example: "Jane Doe" })
    staffName: string;

    @ApiProperty({ description: "Skill level on this service", enum: StaffSkillLevelEnum })
    skillLevel: StaffSkillLevelEnum;

    @ApiProperty({ description: "Whether this assignment is active" })
    isActive: boolean;

    @ApiPropertyOptional({ description: "Stylist years of experience", nullable: true })
    experienceYears?: number | null;

    constructor(mapping: ServiceStaffMapping) {
        this.staffId = mapping.staffId;
        this.skillLevel = mapping.skillLevel;
        this.isActive = mapping.isActive;

        const staff = mapping.staff;
        this.staffName = staff ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() : "";
        this.experienceYears =
            staff?.experienceYears !== undefined && staff?.experienceYears !== null
                ? Number(staff.experienceYears)
                : null;
    }
}
