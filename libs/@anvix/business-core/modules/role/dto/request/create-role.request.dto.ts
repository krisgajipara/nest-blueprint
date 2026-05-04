import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";
import { ValidateNotEmpty, ValidateMaxLength, ValidateType } from "@core-custom-validators";
import { RoleEntityConstant } from "@core-constants";
import { RolePermission } from "@core-database";
import { FieldTypeEnum } from "@core-enums";

/**
 * DTO for creating a new role with permissions
 */
export class CreateRoleRequestDto {
    @ApiProperty({
        description: "Name of the role",
        example: "Admin",
        maxLength: RoleEntityConstant.NameMaxLength
    })
    @ValidateType({ constraints: { field: "role name", type: FieldTypeEnum.String } })
    @ValidateNotEmpty()
    @ValidateMaxLength(RoleEntityConstant.NameMaxLength, { constraints: { field: "role name" } })
    name: string;

    @ApiPropertyOptional({
        description: "Description of the role",
        example: "Administrator role with full access",
        maxLength: RoleEntityConstant.DescriptionMaxLength
    })
    @IsOptional()
    @ValidateType({ constraints: { field: "role description", type: FieldTypeEnum.String } })
    @ValidateMaxLength(RoleEntityConstant.DescriptionMaxLength, { constraints: { field: "role description" } })
    description?: string;

    @ApiProperty({
        description: "Permissions for all modules",
        example: [
            {
                module: "USER",
                permissions: { read: true, write: true, edit: true, delete: false }
            },
            {
                module: "BATCH",
                permissions: { read: true, write: false, edit: false, delete: false }
            }
        ],
        type: [Object]
    })
    @IsArray()
    permissions: RolePermission[];
}
