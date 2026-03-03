import { Column, Entity, Unique } from "typeorm";
import { BaseModifiableEntity } from "../base-entities/base-modifiable-entity";
import { TenantStatus } from "@core-enums";
import { TenantEntityConstant, DatabaseUniqueKey } from "@core-constants";

@Entity("tenant")
@Unique(DatabaseUniqueKey.TenantSubdomain, ["subdomain"])
export class Tenant extends BaseModifiableEntity {
    @Column({
        type: "varchar",
        length: TenantEntityConstant.NameMaxLength,
        nullable: false
    })
    name: string;

    @Column({
        type: "varchar",
        length: TenantEntityConstant.SubdomainMaxLength,
        nullable: false
    })
    subdomain: string;

    @Column({
        type: "jsonb",
        nullable: true,
        default: {}
    })
    config: any;

    @Column({
        type: "varchar",
        nullable: true
    })
    logo: string;

    @Column({
        type: "enum",
        enum: TenantStatus,
        default: TenantStatus.ACTIVE
    })
    status: TenantStatus;
}
