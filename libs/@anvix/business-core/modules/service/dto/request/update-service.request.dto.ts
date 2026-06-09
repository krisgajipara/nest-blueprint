import { ServiceEntityConstant } from "@core-constants";
import {
    ValidateMaxLength,
    ValidateMinValue,
    ValidateOptional,
    ValidateType
} from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class UpdateServiceRequestDto {
    @ApiPropertyOptional({ description: "Service category ID" })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ description: "Service name", example: "Haircut" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "service name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceEntityConstant.NameMaxLength, { constraints: { field: "service name" } })
    name?: string;

    @ApiPropertyOptional({ description: "Service description" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "description", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceEntityConstant.DescriptionMaxLength, { constraints: { field: "description" } })
    description?: string;

    @ApiPropertyOptional({ description: "Price", example: 500 })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "price", type: FieldTypeEnum.Number } })
    @ValidateMinValue(0.01, { constraints: { field: "price" } })
    price?: number;

    @ApiPropertyOptional({ description: "Duration in minutes", example: 30 })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "duration", type: FieldTypeEnum.Number } })
    @ValidateMinValue(1, { constraints: { field: "duration" } })
    durationMin?: number;

    @ApiPropertyOptional({ description: "Active status", example: true })
    @IsOptional()
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.Boolean } })
    isActive?: boolean;
}
