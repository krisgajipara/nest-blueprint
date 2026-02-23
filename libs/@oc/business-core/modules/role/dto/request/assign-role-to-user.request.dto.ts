import { ValidateNotEmpty, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsUUID } from "class-validator";

/**
 * DTO for assigning a role to multiple users
 */
export class AssignRoleToUserRequestDto {
    @ApiProperty({
        description: "User IDs to assign role to",
        example: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"],
        type: [String]
    })
    @IsUUID("all", { each: true })
    @ArrayNotEmpty()
    @ValidateNotEmpty({ constraints: { field: "user ids" } })
    userIds: string[];

    @ApiProperty({
        description: "Role ID to assign",
        example: "12c66cef-6fd5-4159-8722-02773d2a3158"
    })
    @ValidateType({ constraints: { type: FieldTypeEnum.UUID } })
    @ValidateNotEmpty({ constraints: { field: "role id" } })
    roleId: string;
}
