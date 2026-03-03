import { Column, Index } from "typeorm";
import { BaseModifiableEntityWithoutIdentity } from "./base-modifiable-without-identity-entity";

@Index(["tenantId", "deletedAt"])
export class BaseTenantEntity extends BaseModifiableEntityWithoutIdentity {
    @Column({ type: "uuid", name: "tenant_id", nullable: true })
    tenantId: string;
}
