import { ApiProperty } from "@nestjs/swagger";
import { ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

export class UpdateSkillStatusRequestDto {
    @ApiProperty({ description: "Active status" })
    @ValidateType({ constraints: { field: "isActive", type: FieldTypeEnum.Boolean } })
    isActive: boolean;
}
