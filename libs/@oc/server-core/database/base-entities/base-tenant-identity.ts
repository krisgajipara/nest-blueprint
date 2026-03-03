import { Column } from "typeorm";
import { Identity } from "./identity";

/**
 * Base class for tenant-aware entities that only have an ID.
 */
export class BaseTenantIdentity extends Identity {
    @Column({ type: "uuid", name: "tenant_id", nullable: true })
    tenantId: string;
}
