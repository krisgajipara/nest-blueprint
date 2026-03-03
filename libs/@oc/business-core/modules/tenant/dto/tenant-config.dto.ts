import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

export class TenantConfigDto {
    @ApiPropertyOptional({ description: "Primary color", example: "#3f51b5" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "primary color", type: FieldTypeEnum.String } })
    primaryColor?: string;

    @ApiPropertyOptional({ description: "Secondary color", example: "#f50057" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "secondary color", type: FieldTypeEnum.String } })
    secondaryColor?: string;

    @ApiPropertyOptional({ description: "Theme name", example: "dark" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "theme", type: FieldTypeEnum.String } })
    theme?: string;
}
