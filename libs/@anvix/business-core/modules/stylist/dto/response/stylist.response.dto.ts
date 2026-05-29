import { UserStatus } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SkillSummaryDto } from "../../../skill/dto/response/skill-summary.response.dto";
import { UserResponseDto } from "../../../user/dto/response/user.response.dto";

/**
 * Salon-facing stylist profile (backed by user row with userType STYLIST).
 */
export class StylistResponseDto {
    constructor(user: UserResponseDto | Record<string, unknown>) {
        this.id = user.id as string;
        this.firstName = user.firstName as string;
        this.lastName = user.lastName as string;
        this.email = user.email as string;
        this.phoneNumber = (user.phoneNumber as string | null) ?? null;
        this.dateOfBirth = (user.dateOfBirth as string | null) ?? null;
        this.experienceYears =
            user.experienceYears !== undefined && user.experienceYears !== null
                ? Number(user.experienceYears)
                : null;
        this.roleId = (user.roleId as string | null) ?? null;
        this.status = user.status as UserStatus;
        this.createdAt = user.createdAt as Date;
        this.updatedAt = user.updatedAt as Date;
    }

    @ApiProperty({ description: "Stylist user ID" })
    id: string;

    @ApiProperty({ description: "First name" })
    firstName: string;

    @ApiProperty({ description: "Last name" })
    lastName: string;

    @ApiProperty({ description: "Email" })
    email: string;

    @ApiPropertyOptional({ description: "Phone number", nullable: true })
    phoneNumber: string | null;

    @ApiPropertyOptional({ description: "Date of birth", nullable: true })
    dateOfBirth: string | null;

    @ApiPropertyOptional({
        description: "Years of professional salon experience",
        example: 5,
        nullable: true
    })
    experienceYears: number | null;

    @ApiPropertyOptional({ description: "Assigned role ID", nullable: true })
    roleId: string | null;

    @ApiProperty({ description: "Account status", enum: UserStatus })
    status: UserStatus;

    @ApiProperty({ description: "Created at" })
    createdAt: Date;

    @ApiProperty({ description: "Updated at" })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: "Skills assigned to this stylist (admin reference; not enforced on service assignment)",
        type: [SkillSummaryDto]
    })
    skills?: SkillSummaryDto[];
}
