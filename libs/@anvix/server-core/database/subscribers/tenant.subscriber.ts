import { AsyncContextService } from "@core-generic-services";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";

/**
 * TypeORM event subscriber that automatically populates tenantId
 * on entities that have the tenantId column.
 *
 * Uses AsyncContextService static helpers to read tenant id from AsyncLocalStorage
 * (subscribers are outside Nest request-scoped DI).
 */
@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
    /**
     * Called before entity insert
     * Automatically sets tenantId from current request context
     */
    beforeInsert(event: InsertEvent<any>): void {
        if (!event.entity) return;
        this.populateTenantId(event.entity, event.metadata);
    }

    /**
     * Called before entity update
     * Validates tenantId hasn't been changed to a different tenant
     */
    beforeUpdate(event: UpdateEvent<any>): void {
        if (!event.entity) return;
        this.validateTenantId(event.entity, event.metadata);
    }

    /**
     * Helper to set tenantId on entity if it has the column and it's not already set
     */
    private populateTenantId(entity: any, metadata: any): void {
        const tenantColumn = metadata.columns.find((column: any) => column.propertyName === "tenantId");

        if (tenantColumn?.propertyName === "tenantId" && !entity.tenantId) {
            const tenantId = AsyncContextService.getTenantId();
            if (tenantId) {
                entity.tenantId = tenantId;
            }
        }
    }

    /**
     * Helper to validate tenantId hasn't changed during update
     */
    private validateTenantId(entity: any, metadata: any): void {
        const tenantColumn = metadata.columns.find((column: any) => column.propertyName === "tenantId");

        if (tenantColumn?.propertyName === "tenantId" && entity.tenantId) {
            const currentTenantId = AsyncContextService.getTenantId();
            if (currentTenantId && entity.tenantId !== currentTenantId) {
                throw new Error(
                    `Cannot modify entity belonging to tenant ${entity.tenantId}, ` +
                        `current context is ${currentTenantId}`
                );
            }
        }
    }
}
