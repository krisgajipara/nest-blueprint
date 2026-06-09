import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { IsOptional } from "class-validator";

export class ListServiceStaffMappingRequestDto {
    @ApiPropertyOptional({ description: "Filter by assignment active status" })
    @IsOptional()
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.BooleanString } })
    isActive?: boolean;
}
