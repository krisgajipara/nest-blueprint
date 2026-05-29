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
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateStylistRequestDto {
    @ApiPropertyOptional({ description: "Stylist first name" })
    @ValidateOptional()
    @ValidateMinLength(1, { constraints: { field: "first name" } })
    @ValidateMaxLength(UserEntityConstant.FirstNameMaxLength, { constraints: { field: "first name" } })
    @ValidateType({ constraints: { field: "first name", type: FieldTypeEnum.String } })
    firstName?: string;

    @ApiPropertyOptional({ description: "Stylist last name" })
    @ValidateOptional()
    @ValidateMinLength(1, { constraints: { field: "last name" } })
    @ValidateMaxLength(UserEntityConstant.LastNameMaxLength, { constraints: { field: "last name" } })
    @ValidateType({ constraints: { field: "last name", type: FieldTypeEnum.String } })
    lastName?: string;

    @ApiPropertyOptional({ description: "Stylist email" })
    @ValidateOptional()
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "email" } })
    @ValidateEmail({ constraints: { field: "email" } })
    email?: string;

    @ApiPropertyOptional({ description: "Phone number" })
    @ValidateOptional()
    @ValidateMaxLength(UserEntityConstant.PhoneNumberMaxLength, { constraints: { field: "phone number" } })
    @ValidateType({ constraints: { field: "phone number", type: FieldTypeEnum.String } })
    phoneNumber?: string;

    @ApiPropertyOptional({ description: "Date of birth" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "date of birth", type: FieldTypeEnum.String } })
    dateOfBirth?: string;

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

    @ApiPropertyOptional({ description: "Role ID" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "roleId", type: FieldTypeEnum.String } })
    roleId?: string;

    @ApiPropertyOptional({ description: "Account status", enum: UserStatus })
    @ValidateOptional()
    @ValidateEnumType(UserStatus, { constraints: { field: "status" } })
    status?: UserStatus;
}
