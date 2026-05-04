import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    ValidateMaxLength,
    ValidateMinLength,
    ValidateNotEmpty,
    ValidateEmail,
    ValidateOptional,
    ValidateEnumType,
    ValidateType
} from "@core-custom-validators";
import {
    FieldTypeEnum,
    UserTypeEnum
} from "@core-enums";
import { UserEntityConstant } from "@core-constants";

/**
 * DTO for user self-registration
 */
export class RegisterRequestDto {
    @ApiProperty({
        description: "User's first name",
        example: "John",
        minLength: 1,
        maxLength: UserEntityConstant.FirstNameMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "First name" } })
    @ValidateMinLength(1, { constraints: { field: "First name" } })
    @ValidateMaxLength(UserEntityConstant.FirstNameMaxLength, { constraints: { field: "First name" } })
    @ValidateType({ constraints: { field: "firstName", type: FieldTypeEnum.String } })
    firstName: string;

    @ApiProperty({
        description: "User's last name",
        example: "Doe",
        minLength: 1,
        maxLength: UserEntityConstant.LastNameMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "Last name" } })
    @ValidateMinLength(1, { constraints: { field: "Last name" } })
    @ValidateMaxLength(UserEntityConstant.LastNameMaxLength, { constraints: { field: "Last name" } })
    @ValidateType({ constraints: { field: "lastName", type: FieldTypeEnum.String } })
    lastName: string;

    @ApiProperty({
        description: "User's email address",
        example: "john.doe@example.com",
        maxLength: UserEntityConstant.EmailMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "Email" } })
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "Email" } })
    @ValidateEmail({ constraints: { field: "Email" } })
    email: string;

    @ApiProperty({
        description: "User's password",
        example: "password123",
        minLength: 8,
        maxLength: UserEntityConstant.PasswordMaxLength
    })
    @ValidateNotEmpty({ constraints: { field: "Password" } })
    @ValidateMinLength(8, { constraints: { field: "Password" } })
    @ValidateMaxLength(UserEntityConstant.PasswordMaxLength, { constraints: { field: "Password" } })
    @ValidateType({ constraints: { field: "password", type: FieldTypeEnum.String } })
    password: string;

    @ApiPropertyOptional({
        description: "User's phone number",
        example: "+1234567890",
        maxLength: UserEntityConstant.PhoneNumberMaxLength
    })
    @ValidateOptional({ constraints: { field: "Phone number" } })
    @ValidateMaxLength(UserEntityConstant.PhoneNumberMaxLength, { constraints: { field: "Phone number" } })
    @ValidateType({ constraints: { field: "phoneNumber", type: FieldTypeEnum.String } })
    phoneNumber?: string;

    @ApiProperty({
        description: "User's date of birth",
        example: "1990-01-01",
        type: "string",
        format: "date"
    })
    @ValidateNotEmpty({ constraints: { field: "Date of birth" } })
    @ValidateType({ constraints: { field: "dateOfBirth", type: FieldTypeEnum.String } })
    dateOfBirth: string;

    @ApiProperty({
        description: "User's age",
        example: 30
    })
    @ValidateNotEmpty({ constraints: { field: "Age" } })
    @ValidateType({ constraints: { field: "age", type: FieldTypeEnum.NumberString } })
    age: string;

    @ApiPropertyOptional({
        description: "User's type",
        example: UserTypeEnum.USER,
        enum: UserTypeEnum,
        default: UserTypeEnum.USER
    })
    @ValidateOptional({ constraints: { field: "User type" } })
    @ValidateEnumType(UserTypeEnum, { constraints: { field: "User type" } })
    userType?: UserTypeEnum;
}
