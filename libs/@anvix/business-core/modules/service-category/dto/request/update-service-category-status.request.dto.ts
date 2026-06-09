import { ApiProperty } from "@nestjs/swagger";
import { ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

export class UpdateServiceCategoryStatusRequestDto {
    @ApiProperty({ description: "Active status", example: true })
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.Boolean } })
    isActive: boolean;
}
