import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommonSearchRequestDto } from "@business-core-dto";
import { ValidateEnumType, ValidateOptional } from "@core-custom-validators";
import { UserTypeEnum } from "@core-enums";

/**
 * DTO for user dropdown requests with user type filtering
 */
export class UserDropdownRequestDto extends CommonSearchRequestDto {
    @ApiPropertyOptional({
        description: "Filter by user type",
        example: UserTypeEnum.USER,
        enum: UserTypeEnum
    })
    @ValidateOptional()
    @ValidateEnumType(UserTypeEnum, { constraints: { field: "user type" } })
    userType?: UserTypeEnum;
}
