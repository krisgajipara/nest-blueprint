import { UserEntityConstant } from "@core-constants";
import { ValidateMaxLength, ValidateMinLength, ValidateNotEmpty, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEmailRequestDto } from "./base-email-request.dto";

/**
 * Login request DTO
 */
export class LoginRequestDto extends BaseEmailRequestDto {
    @ApiProperty({
        description: "User password",
        example: "password123",
        minLength: UserEntityConstant.PasswordMinLength,
        maxLength: UserEntityConstant.PasswordMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "password" } })
    @ValidateMinLength(UserEntityConstant.PasswordMinLength, { constraints: { field: "password" } })
    @ValidateMaxLength(UserEntityConstant.PasswordMaxLength, { constraints: { field: "password" } })
    @ValidateType({ constraints: { field: "password", type: FieldTypeEnum.String } })
    password: string;

    @ApiProperty({
        type: Boolean,
        description: "remember_me is required",
        example: false
    })
    @ValidateType({ constraints: { field: "rememberMe", type: FieldTypeEnum.Boolean } })
    rememberMe: boolean;
}
