import { ServiceStaffMapping } from "@core-database";
import { StaffSkillLevelEnum, UserStatus } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceStaffMappingResponseDto {
    @ApiProperty({ description: "Mapping ID" })
    id: string;

    @ApiProperty({ description: "Service ID" })
    serviceId: string;

    @ApiProperty({ description: "Staff user ID" })
    staffId: string;

    @ApiProperty({ description: "Staff full name", example: "Jane Stylist" })
    staffName: string;

    @ApiPropertyOptional({ description: "Staff email" })
    staffEmail?: string;

    @ApiProperty({ description: "Staff account status", enum: UserStatus })
    staffStatus: UserStatus;

    @ApiProperty({ description: "Skill level", enum: StaffSkillLevelEnum })
    skillLevel: StaffSkillLevelEnum;

    @ApiProperty({ description: "Assignment active status" })
    isActive: boolean;

    @ApiPropertyOptional({ description: "Created timestamp" })
    createdAt?: Date;

    @ApiPropertyOptional({ description: "Updated timestamp" })
    updatedAt?: Date;

    constructor(mapping: ServiceStaffMapping) {
        this.id = mapping.id;
        this.serviceId = mapping.serviceId;
        this.staffId = mapping.staffId;
        this.skillLevel = mapping.skillLevel;
        this.isActive = mapping.isActive;
        this.createdAt = mapping.createdAt;
        this.updatedAt = mapping.updatedAt;

        const staff = mapping.staff;
        if (staff) {
            this.staffName = `${staff.firstName} ${staff.lastName}`.trim();
            this.staffEmail = staff.email;
            this.staffStatus = staff.status;
        } else {
            this.staffName = "";
            this.staffStatus = UserStatus.INACTIVE;
        }
    }
}
