import { ApiProperty } from "@nestjs/swagger";
import { UserEntityConstant } from "@core-constants";
import { ValidateEmail, ValidateMaxLength, ValidateNotEmpty } from "@core-custom-validators";

/**
 * Base class for email validation in auth request DTOs
 */
export class BaseEmailRequestDto {
    @ApiProperty({
        description: "User email address",
        example: "user@example.com",
        maxLength: UserEntityConstant.EmailMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "email" } })
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "email" } })
    @ValidateEmail({ constraints: { field: "email" } })
    email: string;
}
