import { ValidateEmail, ValidateNotEmpty, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Forgot password request DTO
 */
export class ForgotPasswordRequestDto {
    @ApiProperty({
        description: "User email address",
        example: "user@example.com"
    })
    @ValidateEmail({ constraints: { field: "email" } })
    @ValidateNotEmpty({ constraints: { field: "email" } })
    email: string;

    @ApiProperty({
        description: "Platform (front/admin)",
        example: "front"
    })
    @ValidateType({ constraints: { field: "platform", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "platform" } })
    platform: string;
}
