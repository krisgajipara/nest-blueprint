import { Column, Index } from "typeorm";
import { BaseCreatableEntity } from "./base-creatable-entity";

/**
 * Base class for tenant-aware creatable entities that have an ID.
 */
@Index(["tenantId"])
export class BaseTenantCreatableEntity extends BaseCreatableEntity {
    @Column({ type: "uuid", name: "tenant_id", nullable: true })
    tenantId: string;
}
