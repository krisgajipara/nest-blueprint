import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, UserStatus, UserTypeEnum } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO for listing users with search, filter, pagination, and sorting
 */
export class ListUserRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "Filter by user type",
        example: UserTypeEnum.USER,
        enum: UserTypeEnum
    })
    @ValidateOptional()
    @ValidateEnumType(UserTypeEnum, { constraints: { field: "user type" } })
    userType?: UserTypeEnum;

    @ApiPropertyOptional({
        description: "Filter by user status",
        example: UserStatus.ACTIVE,
        enum: UserStatus
    })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;

    @ApiPropertyOptional({
        description: "Sort by field",
        example: "createdAt",
        enum: ["firstName", "lastName", "name", "email", "age", "createdAt", "updatedAt"]
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "sort by", type: FieldTypeEnum.String } })
    sortBy?: string;

}
