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
import { UserEntityConstant } from "@core-constants";
import {
    FieldTypeEnum,
    UserTypeEnum,
    UserStatus
} from "@core-enums";
import { IsInt, IsOptional, Max, Min } from "class-validator";

/**
 * DTO for creating a new user
 */
export class CreateUserRequestDto {
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

    @ApiPropertyOptional({
        description: "User's password",
        example: "password123",
        minLength: 8,
        maxLength: UserEntityConstant.PasswordMaxLength
    })
    @ValidateOptional({ constraints: { field: "Password" } })
    @ValidateMinLength(8, { constraints: { field: "Password" } })
    @ValidateMaxLength(UserEntityConstant.PasswordMaxLength, { constraints: { field: "Password" } })
    @ValidateType({ constraints: { field: "password", type: FieldTypeEnum.String } })
    password: string;

    @ApiProperty({
        description: "User's phone number",
        example: "+1234567890",
        maxLength: UserEntityConstant.PhoneNumberMaxLength,
        required: false
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

    @ApiProperty({
        description: "User's type",
        example: UserTypeEnum.ADMIN,
        enum: UserTypeEnum,
        default: UserTypeEnum.ADMIN,
        required: false
    })
    @ValidateOptional({ constraints: { field: "User type" } })
    @ValidateEnumType(UserTypeEnum, { constraints: { field: "User type" } })
    userType?: UserTypeEnum;

    @ApiPropertyOptional({
        description: "Years of professional experience (stylists)",
        example: 5
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(UserEntityConstant.ExperienceYearsMax)
    experienceYears?: number;

    @ApiPropertyOptional({
        description: "User's role ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "roleId", type: FieldTypeEnum.String } })
    roleId?: string;

    @ApiPropertyOptional({
        description: "User's status",
        example: UserStatus.ACTIVE,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;
}
