import { ServiceCategory } from "@core-database";
import { ServiceGenderEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceCategoryResponseDto {
    @ApiProperty({ description: "Category ID" })
    id: string;

    @ApiProperty({ description: "Category name", example: "Hair" })
    name: string;

    @ApiProperty({ description: "Target gender", enum: ServiceGenderEnum })
    gender: ServiceGenderEnum;

    @ApiProperty({ description: "Active status", example: true })
    isActive: boolean;

    @ApiPropertyOptional({ description: "Created timestamp" })
    createdAt?: Date;

    @ApiPropertyOptional({ description: "Updated timestamp" })
    updatedAt?: Date;

    constructor(category: ServiceCategory) {
        this.id = category.id;
        this.name = category.name;
        this.gender = category.gender;
        this.isActive = category.isActive;
        this.createdAt = category.createdAt;
        this.updatedAt = category.updatedAt;
    }
}
