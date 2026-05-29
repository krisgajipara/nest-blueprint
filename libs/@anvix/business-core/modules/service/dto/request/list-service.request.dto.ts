import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional } from "@core-custom-validators";
import { ServiceGenderEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

export class ListServiceRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({ description: "Filter by category ID" })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ description: "Filter by category gender", enum: ServiceGenderEnum })
    @ValidateOptional()
    @ValidateEnumType(ServiceGenderEnum, { constraints: { field: "gender" } })
    gender?: ServiceGenderEnum;

    @ApiPropertyOptional({ description: "Filter by active status", example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ description: "Filter services assigned to staff user ID" })
    @IsOptional()
    @IsUUID()
    staffId?: string;

    @ApiPropertyOptional({ description: "Filter by staff name (first or last name)" })
    @IsOptional()
    @IsString()
    staffSearchText?: string;

    @ApiPropertyOptional({ description: "Filter by staff assignment active status when staff filter is used" })
    @IsOptional()
    @IsBoolean()
    assignmentIsActive?: boolean;

    @ApiPropertyOptional({
        description: "Include skills linked to each service in the list response",
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    includeSkills?: boolean;

    @ApiPropertyOptional({
        description: "Include assigned stylists on each service in the list response",
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    includeAssignedStaff?: boolean;

    @ApiPropertyOptional({
        description: "Sort by field",
        example: "price",
        enum: ["name", "price", "durationMin", "createdAt", "updatedAt"]
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
