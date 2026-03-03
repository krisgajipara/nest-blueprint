import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";
import { TenantContext } from "../../utilities/tenant-context.service";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
    /**
     * Set tenantId before insert
     */
    beforeInsert(event: InsertEvent<any>) {
        if (!event.entity) return;
        this.populateTenantId(event.entity, event.metadata);
    }

    /**
     * Set tenantId before update
     */
    beforeUpdate(event: UpdateEvent<any>) {
        if (!event.entity) return;
        this.populateTenantId(event.entity, event.metadata);
    }

    /**
     * Helper to check for tenantId field and populate it
     */
    private populateTenantId(entity: any, metadata: any) {
        if (metadata.columns.find((column: any) => column.propertyName === "tenantId")?.propertyName === "tenantId") {
            if (!entity.tenantId) {
                entity.tenantId = TenantContext.getTenantId();
            }
        }
    }
}
