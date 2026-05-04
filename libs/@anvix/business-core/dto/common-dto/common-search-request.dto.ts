import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { ValidateEnumType, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, SortDirection } from "@core-enums";

export class CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "search text",
        example: ""
    })
    @IsOptional()
    searchText?: string;

    @ValidateType({ constraints: { field: "pageSize", type: FieldTypeEnum.NumberString } })
    @ApiProperty({
        description: "page size",
        example: "10"
    })
    pageSize?: number = 10;

    @ValidateType({ constraints: { field: "pageNumber", type: FieldTypeEnum.NumberString } })
    @ApiProperty({
        description: "page number",
        example: "1"
    })
    pageNumber?: number = 1;

    @ValidateEnumType(SortDirection, { constraints: { field: "sortDirection" } })
    @ApiProperty({
        description: "sort direction",
        example: "DESC"
    })
    sortDirection?: SortDirection = SortDirection.DESC;
}
