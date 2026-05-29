import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, UserStatus } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListStylistRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({ description: "Filter by status", enum: UserStatus })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;

    @ApiPropertyOptional({
        description: "Sort by field",
        example: "createdAt",
        enum: ["firstName", "lastName", "name", "email", "experienceYears", "createdAt", "updatedAt"]
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "sort by", type: FieldTypeEnum.String } })
    sortBy?: string;
}
