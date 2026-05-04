import { Column, Index } from "typeorm";
import { BaseModifiableEntityWithoutIdentity } from "./base-modifiable-without-identity-entity";

/**
 * Base tenant-aware entity without identity (no PK) and full audit tracking
 * Adds tenantId with index for tenant data isolation
 */
export class BaseTenantModifiableEntityWithoutIdentity extends BaseModifiableEntityWithoutIdentity {
    @Index()
    @Column({ type: "uuid", name: "tenant_id", nullable: true })
    tenantId: string;
}
