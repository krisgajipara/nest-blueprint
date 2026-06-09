import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, ServiceGenderEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

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
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.BooleanString } })
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
    @ValidateType({ constraints: { field: "assignmentIsActive", type: FieldTypeEnum.BooleanString } })
    assignmentIsActive?: boolean;

    @ApiPropertyOptional({
        description: "Include skills linked to each service in the list response",
        example: true,
        default: true
    })
    @IsOptional()
    @ValidateType({ constraints: { field: "includeSkills", type: FieldTypeEnum.BooleanString } })
    includeSkills?: boolean;

    @ApiPropertyOptional({
        description: "Include assigned stylists on each service in the list response",
        example: true,
        default: true
    })
    @IsOptional()
    @ValidateType({ constraints: { field: "includeAssignedStaff", type: FieldTypeEnum.BooleanString } })
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
