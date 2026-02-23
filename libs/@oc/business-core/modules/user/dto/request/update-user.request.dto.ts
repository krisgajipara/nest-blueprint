import { UserEntityConstant } from "@core-constants";
import {
    ValidateEmail,
    ValidateEnumType,
    ValidateMaxLength,
    ValidateMinLength,
    ValidateOptional,
    ValidateType
} from "@core-custom-validators";
import { FieldTypeEnum, UserStatus } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO for updating user details
 */
export class UpdateUserRequestDto {
    @ApiPropertyOptional({
        description: "User's first name",
        example: "John",
        minLength: 1,
        maxLength: UserEntityConstant.FirstNameMaxLength
    })
    @ValidateOptional()
    @ValidateMinLength(1, { constraints: { field: "first name" } })
    @ValidateMaxLength(UserEntityConstant.FirstNameMaxLength, { constraints: { field: "first name" } })
    @ValidateType({ constraints: { field: "first name", type: FieldTypeEnum.String } })
    firstName?: string;

    @ApiPropertyOptional({
        description: "User's last name",
        example: "Doe",
        minLength: 1,
        maxLength: UserEntityConstant.LastNameMaxLength
    })
    @ValidateOptional()
    @ValidateMinLength(1, { constraints: { field: "last name" } })
    @ValidateMaxLength(UserEntityConstant.LastNameMaxLength, { constraints: { field: "last name" } })
    @ValidateType({ constraints: { field: "last name", type: FieldTypeEnum.String } })
    lastName?: string;

    @ApiPropertyOptional({
        description: "User's email address",
        example: "john.doe@example.com",
        maxLength: UserEntityConstant.EmailMaxLength
    })
    @ValidateOptional()
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "email" } })
    @ValidateEmail({ constraints: { field: "email" } })
    email?: string;

    @ApiPropertyOptional({
        description: "User's phone number",
        example: "+1234567890",
        maxLength: UserEntityConstant.PhoneNumberMaxLength
    })
    @ValidateOptional()
    @ValidateMaxLength(UserEntityConstant.PhoneNumberMaxLength, { constraints: { field: "phone number" } })
    @ValidateType({ constraints: { field: "phone number", type: FieldTypeEnum.String } })
    phoneNumber?: string;

    @ApiPropertyOptional({
        description: "User's date of birth",
        example: "1990-01-01",
        type: "string",
        format: "date"
    })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "date of birth", type: FieldTypeEnum.String } })
    dateOfBirth?: string;

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
        enum: UserStatus
    })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;
}
