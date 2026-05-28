import { ServiceEntityConstant } from "@core-constants";
import {
    ValidateMaxLength,
    ValidateMinValue,
    ValidateNotEmpty,
    ValidateType
} from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";

export class CreateServiceRequestDto {
    @ApiProperty({ description: "Service category ID" })
    @ValidateNotEmpty({ constraints: { field: "category" } })
    @IsUUID()
    categoryId: string;

    @ApiProperty({ description: "Service name", example: "Haircut" })
    @ValidateNotEmpty({ constraints: { field: "service name" } })
    @ValidateType({ constraints: { field: "service name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceEntityConstant.NameMaxLength, { constraints: { field: "service name" } })
    name: string;

    @ApiPropertyOptional({ description: "Service description" })
    @IsOptional()
    @ValidateType({ constraints: { field: "description", type: FieldTypeEnum.String } })
    @ValidateMaxLength(ServiceEntityConstant.DescriptionMaxLength, { constraints: { field: "description" } })
    description?: string;

    @ApiProperty({ description: "Price", example: 500 })
    @ValidateNotEmpty({ constraints: { field: "price" } })
    @ValidateType({ constraints: { field: "price", type: FieldTypeEnum.Number } })
    @ValidateMinValue(0.01, { constraints: { field: "price" } })
    price: number;

    @ApiProperty({ description: "Duration in minutes", example: 30 })
    @ValidateNotEmpty({ constraints: { field: "duration" } })
    @ValidateType({ constraints: { field: "duration", type: FieldTypeEnum.Number } })
    @ValidateMinValue(1, { constraints: { field: "duration" } })
    durationMin: number;

    @ApiPropertyOptional({ description: "Active status", example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
