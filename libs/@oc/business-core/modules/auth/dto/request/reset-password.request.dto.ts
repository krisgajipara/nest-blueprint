import { ValidateNotEmpty, ValidateMinLength, ValidateMaxLength, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";
import { UserEntityConstant } from "@core-constants";
import { BaseEmailRequestDto } from "./base-email-request.dto";

/**
 * Reset password request DTO
 */
export class ResetPasswordRequestDto extends BaseEmailRequestDto {
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
    newPassword: string;
}
