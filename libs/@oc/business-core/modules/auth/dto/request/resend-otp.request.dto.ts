import { ApiProperty } from "@nestjs/swagger";
import { OtpType } from "@core-enums";
import { ValidateEmail, ValidateEnumType, ValidateNotEmpty } from "@core-custom-validators";

/**
 * Resend OTP request DTO
 */
export class ResendOtpRequestDto {
    @ApiProperty({
        description: "User email address",
        example: "user@example.com"
    })
    @ValidateEmail({ constraints: { field: "email" } })
    @ValidateNotEmpty({ constraints: { field: "email" } })
    email: string;

    @ApiProperty({
        description: "OTP type",
        enum: OtpType,
        example: OtpType.LOGIN
    })
    @ValidateEnumType(OtpType, { constraints: { field: "otpType" } })
    @ValidateNotEmpty({ constraints: { field: "otpType" } })
    otpType: OtpType;
}
