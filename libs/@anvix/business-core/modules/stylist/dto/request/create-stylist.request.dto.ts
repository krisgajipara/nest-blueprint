import { UserEntityConstant } from "@core-constants";
import {
    ValidateEmail,
    ValidateEnumType,
    ValidateMaxLength,
    ValidateMinLength,
    ValidateNotEmpty,
    ValidateOptional,
    ValidateType
} from "@core-custom-validators";
import { FieldTypeEnum, UserStatus } from "@core-enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";

/**
 * DTO for creating a stylist (tenant user with userType STYLIST).
 */
export class CreateStylistRequestDto {
    @ApiProperty({ description: "Stylist first name", example: "Jane" })
    @ValidateNotEmpty({ constraints: { field: "First name" } })
    @ValidateMinLength(1, { constraints: { field: "First name" } })
    @ValidateMaxLength(UserEntityConstant.FirstNameMaxLength, { constraints: { field: "First name" } })
    @ValidateType({ constraints: { field: "firstName", type: FieldTypeEnum.String } })
    firstName: string;

    @ApiProperty({ description: "Stylist last name", example: "Doe" })
    @ValidateNotEmpty({ constraints: { field: "Last name" } })
    @ValidateMinLength(1, { constraints: { field: "Last name" } })
    @ValidateMaxLength(UserEntityConstant.LastNameMaxLength, { constraints: { field: "Last name" } })
    @ValidateType({ constraints: { field: "lastName", type: FieldTypeEnum.String } })
    lastName: string;

    @ApiProperty({ description: "Stylist email", example: "jane.doe@example.com" })
    @ValidateNotEmpty({ constraints: { field: "Email" } })
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "Email" } })
    @ValidateEmail({ constraints: { field: "Email" } })
    email: string;

    @ApiPropertyOptional({ description: "Initial password", minLength: 8 })
    @ValidateOptional({ constraints: { field: "Password" } })
    @ValidateMinLength(8, { constraints: { field: "Password" } })
    @ValidateMaxLength(UserEntityConstant.PasswordMaxLength, { constraints: { field: "Password" } })
    @ValidateType({ constraints: { field: "password", type: FieldTypeEnum.String } })
    password?: string;

    @ApiPropertyOptional({ description: "Phone number", example: "+1234567890" })
    @ValidateOptional({ constraints: { field: "Phone number" } })
    @ValidateMaxLength(UserEntityConstant.PhoneNumberMaxLength, { constraints: { field: "Phone number" } })
    @ValidateType({ constraints: { field: "phoneNumber", type: FieldTypeEnum.String } })
    phoneNumber?: string;

    @ApiProperty({ description: "Date of birth", example: "1990-01-01" })
    @ValidateNotEmpty({ constraints: { field: "Date of birth" } })
    @ValidateType({ constraints: { field: "dateOfBirth", type: FieldTypeEnum.String } })
    dateOfBirth: string;

    @ApiProperty({ description: "Age", example: "30" })
    @ValidateNotEmpty({ constraints: { field: "Age" } })
    @ValidateType({ constraints: { field: "age", type: FieldTypeEnum.NumberString } })
    age: string;

    @ApiPropertyOptional({
        description: "Years of professional salon experience",
        example: 5,
        minimum: 0,
        maximum: UserEntityConstant.ExperienceYearsMax
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(UserEntityConstant.ExperienceYearsMax)
    experienceYears?: number;

    @ApiPropertyOptional({ description: "Role ID for salon RBAC" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "roleId", type: FieldTypeEnum.String } })
    roleId?: string;

    @ApiPropertyOptional({ description: "Account status", enum: UserStatus, default: UserStatus.ACTIVE })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;
}
