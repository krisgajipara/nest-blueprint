import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";
import { ValidateMaxLength, ValidateType } from "@core-custom-validators";
import { RoleEntityConstant } from "@core-constants";
import { RolePermission } from "@core-database";
import { FieldTypeEnum } from "@core-enums";

/**
 * DTO for updating an existing role with permissions
 */
export class UpdateRoleRequestDto {
    @ApiPropertyOptional({
        description: "Name of the role",
        example: "Admin",
        maxLength: RoleEntityConstant.NameMaxLength
    })
    @IsOptional()
    @ValidateType({ constraints: { field: "role name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(RoleEntityConstant.NameMaxLength, { constraints: { field: "role name" } })
    name?: string;

    @ApiPropertyOptional({
        description: "Description of the role",
        example: "Administrator role with full access",
        maxLength: RoleEntityConstant.DescriptionMaxLength
    })
    @IsOptional()
    @ValidateType({ constraints: { field: "role description", type: FieldTypeEnum.String } })
    @ValidateMaxLength(RoleEntityConstant.DescriptionMaxLength, { constraints: { field: "role description" } })
    description?: string;

    @ApiPropertyOptional({
        description: "Updated permissions for all modules",
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
    @IsOptional()
    @IsArray()
    permissions?: RolePermission[];
}
