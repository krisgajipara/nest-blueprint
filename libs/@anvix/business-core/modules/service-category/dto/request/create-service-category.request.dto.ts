import { ServiceCategoryEntityConstant } from "@core-constants";
import { ValidateEnumType, ValidateMaxLength, ValidateNotEmpty, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, ServiceGenderEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateServiceCategoryRequestDto {
    @ApiProperty({ description: "Category name", example: "Hair", maxLength: ServiceCategoryEntityConstant.NameMaxLength })
    @ValidateNotEmpty({ constraints: { field: "category name" } })
    @ValidateType({ constraints: { field: "category name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceCategoryEntityConstant.NameMaxLength, { constraints: { field: "category name" } })
    name: string;

    @ApiProperty({ description: "Target gender", enum: ServiceGenderEnum, example: ServiceGenderEnum.UNISEX })
    @ValidateEnumType(ServiceGenderEnum, { constraints: { field: "gender" } })
    gender: ServiceGenderEnum;

    @ApiPropertyOptional({ description: "Active status", example: true, default: true })
    @IsOptional()
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.Boolean } })
    isActive?: boolean;
}
