import { RoleEntityConstant } from "@core-constants";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { SystemRoleType } from "@core-enums";
import { Column, Entity } from "typeorm";

/**
 * Permission interface for individual module permissions
 */
export interface Permission {
    read: boolean;
    write: boolean;
    edit: boolean;
    delete: boolean;
}

/**
 * RolePermission interface for role-based permissions per module
 */
export interface RolePermission {
    module: string;
    permissions: Permission;
}

/**
 * Role entity representing dynamic roles in the RBAC system
 * Permissions are stored as JSON in the role table
 */
@Entity("role")
export class Role extends BaseTenantModifiableEntity {
    @Column({
        type: "varchar",
        length: RoleEntityConstant.NameMaxLength,
        name: "name",
        nullable: false
    })
    name: string;

    @Column({
        type: "varchar",
        length: RoleEntityConstant.DescriptionMaxLength,
        name: "description",
        nullable: true
    })
    description: string | null;

    @Column({
        type: "jsonb",
        name: "permissions",
        nullable: false,
        default: []
    })
    permissions: RolePermission[];

    @Column({
        type: "enum",
        enum: SystemRoleType,
        name: "system_role_type",
        nullable: true
    })
    systemRoleType: SystemRoleType | null;

    @Column({
        type: "boolean",
        name: "is_active",
        default: true
    })
    isActive: boolean;
}
