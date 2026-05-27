import { ITenantConfig } from "@core-interfaces";
import { TenantStatus } from "@core-enums";
import { Column, Entity, Index } from "typeorm";
import { BaseSystemModifiableEntity } from "../base-entities/base-system-modifiable-entity";

/**
 * Tenant entity representing a multi-tenant organization
 * This entity does NOT have a tenantId — it IS the tenant
 */
@Entity("tenant")
export class Tenant extends BaseSystemModifiableEntity {
    @Column({
        type: "varchar",
        length: 255,
        name: "name",
        nullable: false
    })
    name: string;

    @Index()
    @Column({
        type: "varchar",
        length: 255,
        name: "subdomain",
        unique: true,
        nullable: false
    })
    subdomain: string;

    @Column({
        type: "jsonb",
        name: "config",
        nullable: true,
        default: {}
    })
    config: ITenantConfig;

    @Column({
        type: "varchar",
        length: 500,
        name: "logo",
        nullable: true
    })
    logo: string;

    @Column({
        type: "enum",
        enum: TenantStatus,
        name: "status",
        default: TenantStatus.ACTIVE,
        nullable: false
    })
    status: TenantStatus;
}
