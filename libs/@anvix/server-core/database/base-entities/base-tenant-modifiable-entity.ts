import { Column, Index } from "typeorm";
import { BaseModifiableEntity } from "./base-modifiable-entity";

/**
 * Base tenant-aware entity with full audit tracking
 * Adds tenantId with index for tenant data isolation
 */
export class BaseTenantModifiableEntity extends BaseModifiableEntity {
    @Index()
    @Column({ type: "uuid", name: "tenant_id", nullable: true })
    tenantId: string;
}
