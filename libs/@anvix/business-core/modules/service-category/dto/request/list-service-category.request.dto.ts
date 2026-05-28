import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional } from "@core-custom-validators";
import { ServiceGenderEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ListServiceCategoryRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({ description: "Filter by gender", enum: ServiceGenderEnum })
    @ValidateOptional()
    @ValidateEnumType(ServiceGenderEnum, { constraints: { field: "gender" } })
    gender?: ServiceGenderEnum;

    @ApiPropertyOptional({ description: "Filter by active status", example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Sort by field",
        example: "name",
        enum: ["name", "gender", "createdAt", "updatedAt"]
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
