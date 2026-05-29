import { Service, ServiceCategory } from "@core-database";
import { ServiceGenderEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SkillSummaryDto } from "../../../skill/dto/response/skill-summary.response.dto";
import { AssignedStaffSummaryDto } from "./assigned-staff-summary.response.dto";

export class ServiceResponseDto {
    @ApiProperty({ description: "Service ID" })
    id: string;

    @ApiProperty({ description: "Category ID" })
    categoryId: string;

    @ApiProperty({ description: "Category name", example: "Hair" })
    categoryName: string;

    @ApiProperty({ description: "Category gender", enum: ServiceGenderEnum })
    gender: ServiceGenderEnum;

    @ApiProperty({ description: "Service name", example: "Haircut" })
    name: string;

    @ApiPropertyOptional({ description: "Service description" })
    description?: string | null;

    @ApiProperty({ description: "Price", example: 500 })
    price: number;

    @ApiProperty({ description: "Duration in minutes", example: 30 })
    durationMin: number;

    @ApiPropertyOptional({ description: "Image file name or URL" })
    image?: string | null;

    @ApiPropertyOptional({ description: "Full image URL when available" })
    imageUrl?: string | null;

    @ApiProperty({ description: "Active status", example: true })
    isActive: boolean;

    @ApiPropertyOptional({ description: "Created timestamp" })
    createdAt?: Date;

    @ApiPropertyOptional({ description: "Updated timestamp" })
    updatedAt?: Date;

    @ApiPropertyOptional({
        description: "Stylists assigned to this service (when includeAssignedStaff is enabled)",
        type: [AssignedStaffSummaryDto]
    })
    assignedStaff?: AssignedStaffSummaryDto[];

    @ApiPropertyOptional({
        description: "Skills linked to this service (admin reference when assigning stylists)",
        type: [SkillSummaryDto]
    })
    skills?: SkillSummaryDto[];

    constructor(
        service: Service,
        imageBaseUrl?: string,
        assignedStaff?: AssignedStaffSummaryDto[],
        skills?: SkillSummaryDto[]
    ) {
        this.id = service.id;
        this.categoryId = service.categoryId;
        this.name = service.name;
        this.description = service.description;
        this.price = Number(service.price);
        this.durationMin = service.durationMin;
        this.image = service.image;
        this.isActive = service.isActive;
        this.createdAt = service.createdAt;
        this.updatedAt = service.updatedAt;

        const category = service.category as ServiceCategory | undefined;
        this.categoryName = category?.name ?? "";
        this.gender = category?.gender as ServiceGenderEnum;

        if (service.image && imageBaseUrl) {
            this.imageUrl = `${imageBaseUrl}/services/images/${service.image}`;
        }

        if (assignedStaff?.length) {
            this.assignedStaff = assignedStaff;
        }

        if (skills?.length) {
            this.skills = skills;
        }
    }
}
