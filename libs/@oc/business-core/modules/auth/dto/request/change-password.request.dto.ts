import { UserEntityConstant } from "@core-constants";
import { ValidateNotEmpty, ValidateMinLength, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Change password request DTO
 */
export class ChangePasswordRequestDto {
    @ApiProperty({
        description: "Current password",
        example: "oldpassword123"
    })
    @ValidateType({ constraints: { field: "oldPassword", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "oldPassword" } })
    oldPassword: string;

    @ApiProperty({
        description: "New password",
        example: "newpassword123"
    })
    @ValidateType({ constraints: { field: "newPassword", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "newPassword" } })
    @ValidateMinLength(UserEntityConstant.PasswordMinLength, { constraints: { field: "newPassword" } })
    newPassword: string;
}
