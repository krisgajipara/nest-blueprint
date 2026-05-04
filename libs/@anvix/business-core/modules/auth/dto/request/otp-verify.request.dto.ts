import { OtpEntityConstant } from "@core-constants";
import { ValidateEmail, ValidateNotEmpty, ValidateType, ValidateMaxLength, ValidateEnumType } from "@core-custom-validators";
import { ApiProperty } from "@nestjs/swagger";
import { FieldTypeEnum, OtpType } from "@core-enums";

/**
 * OTP verification request DTO
 */
export class OtpVerifyRequestDto {
    @ApiProperty({
        description: "User email address",
        example: "user@example.com"
    })
    @ValidateEmail({ constraints: { field: "email" } })
    @ValidateNotEmpty({ constraints: { field: "email" } })
    email: string;

    @ApiProperty({
        description: `${OtpEntityConstant.OtpLength}-digit OTP code`,
        example: "123456"
    })
    @ValidateType({ constraints: { field: "otp", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "otp" } })
    @ValidateMaxLength(OtpEntityConstant.OtpLength, { constraints: { field: "otp" } })
    otp: string;

    @ApiProperty({
        description: "OTP type",
        enum: OtpType,
        example: OtpType.LOGIN
    })
    @ValidateEnumType(OtpType, { constraints: { field: "otpType" } })
    @ValidateNotEmpty({ constraints: { field: "otpType" } })
    otpType: OtpType;
}
