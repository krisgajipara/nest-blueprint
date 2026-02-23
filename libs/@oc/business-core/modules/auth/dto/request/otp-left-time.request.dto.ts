import { OtpType } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";
import { ValidateEmail, ValidateEnumType, ValidateNotEmpty } from "@core-custom-validators";

/**
 * OTP left time request DTO
 */
export class OtpLeftTimeRequestDto {
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
