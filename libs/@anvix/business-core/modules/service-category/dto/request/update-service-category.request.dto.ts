import { ServiceCategoryEntityConstant } from "@core-constants";
import { ValidateEnumType, ValidateMaxLength, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, ServiceGenderEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateServiceCategoryRequestDto {
    @ApiPropertyOptional({ description: "Category name", example: "Hair" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "category name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceCategoryEntityConstant.NameMaxLength, { constraints: { field: "category name" } })
    name?: string;

    @ApiPropertyOptional({ description: "Target gender", enum: ServiceGenderEnum })
    @ValidateOptional()
    @ValidateEnumType(ServiceGenderEnum, { constraints: { field: "gender" } })
    gender?: ServiceGenderEnum;

    @ApiPropertyOptional({ description: "Active status", example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
