import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RolePermission } from "@core-database";
import { SystemRoleType } from "@core-enums";

/**
 * Response DTO for default permissions structure
 * Used for UI to display available modules and their default permissions
 */
export class DefaultPermissionsResponseDto {
    @ApiProperty({
        description: "List of available modules",
        example: ["USER", "BATCH", "AUTH", "STATE", "ROLE"],
        type: [String]
    })
    modules: string[];

    @ApiProperty({
        description: "Default permissions for each module",
        example: [
            {
                module: "USER",
                permissions: {
                    read: true,
                    write: true,
                    edit: true,
                    delete: true
                }
            },
            {
                module: "BATCH",
                permissions: {
                    read: true,
                    write: true,
                    edit: true,
                    delete: true
                }
            }
        ],
        type: [Object]
    })
    permissions: RolePermission[];

    constructor(partial: Partial<DefaultPermissionsResponseDto>) {
        this.modules = partial.modules || [];
        this.permissions = partial.permissions || [];
    }
}

/**
 * Response DTO for Role entity (without permissions - for listing)
 */
export class RoleListResponseDto {
    @ApiProperty({
        description: "Unique identifier of the role",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "Name of the role",
        example: "Admin"
    })
    name: string;

    @ApiPropertyOptional({
        description: "Description of the role",
        example: "Administrator role with full access"
    })
    description?: string;

    @ApiProperty({
        description: "Whether this is a system role",
        example: false
    })
    isSystemRole: boolean;

    @ApiPropertyOptional({
        description: "System role type if it's a system role",
        example: "admin",
        enum: SystemRoleType
    })
    systemRoleType?: SystemRoleType;

    @ApiProperty({
        description: "Whether the role is active",
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: "Creation timestamp",
        example: "2023-01-01T00:00:00.000Z"
    })
    createdAt: Date;

    constructor(partial: Partial<RoleListResponseDto>) {
        this.id = partial.id;
        this.name = partial.name;
        this.description = partial.description;
        this.systemRoleType = partial.systemRoleType;
        this.isActive = partial.isActive;
        this.createdAt = partial.createdAt;
        // Compute isSystemRole based on systemRoleType for backward compatibility
        if (partial.systemRoleType !== undefined) {
            this.isSystemRole = partial.systemRoleType !== null && partial.systemRoleType !== undefined;
        }
    }
}

/**
 * Response DTO for Role entity (with permissions - for detail view)
 */
export class RoleDetailResponseDto {
    @ApiProperty({
        description: "Unique identifier of the role",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "Name of the role",
        example: "Admin"
    })
    name: string;

    @ApiPropertyOptional({
        description: "Description of the role",
        example: "Administrator role with full access"
    })
    description?: string;

    @ApiProperty({
        description: "Whether this is a system role",
        example: false
    })
    isSystemRole: boolean;

    @ApiPropertyOptional({
        description: "System role type if it's a system role",
        example: "admin",
        enum: SystemRoleType
    })
    systemRoleType?: SystemRoleType;

    @ApiProperty({
        description: "Whether the role is active",
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: "Role permissions assigned to this role",
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
    permissions: RolePermission[];

    constructor(partial: Partial<RoleDetailResponseDto>) {
        this.id = partial.id;
        this.name = partial.name;
        this.description = partial.description;
        this.isSystemRole = partial.isSystemRole;
        this.systemRoleType = partial.systemRoleType;
        this.isActive = partial.isActive;
        this.permissions = partial.permissions || [];
    }
}
