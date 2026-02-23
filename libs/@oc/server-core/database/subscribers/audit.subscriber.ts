import { AuditContext } from "@core-generic-services";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, SoftRemoveEvent, UpdateEvent } from "typeorm";

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    /**
     * This method is called before an insert operation. We set the createdBy and updatedBy fields here.
     * @param event
     * @returns
     */
    beforeInsert(event: InsertEvent<any>) {
        if (!event.entity) return;

        const userId = AuditContext.getUserId();

        if (
            event.metadata.columns.find((column) => column.propertyName === "createdBy")?.propertyName === "createdBy"
        ) {
            (event.entity as any).createdBy = userId;
        }
        if (
            event.metadata.columns.find((column) => column.propertyName === "updatedBy")?.propertyName === "updatedBy"
        ) {
            (event.entity as any).updatedBy = userId;
        }
    }

    /**
     * This method is called before an update operation. We set the updatedBy field here.
     * @param event
     * @returns
     */
    beforeUpdate(event: UpdateEvent<any>) {
        if (!event.entity) return;

        const userId = AuditContext.getUserId();

        if (
            event.metadata.columns.find((column) => column.propertyName === "updatedBy")?.propertyName === "updatedBy"
        ) {
            (event.entity as any).updatedBy = userId;
        }
    }

    /**
     * This method is called after a soft remove operation. We have to manually set the deletedBy field
     * @param event
     * @returns
     */
    async afterSoftRemove(event: SoftRemoveEvent<any>): Promise<any> {
        if (!event.entity) return;

        const userId = AuditContext.getUserId();
        if (
            event.metadata.columns.find((column) => column.propertyName === "deletedBy")?.propertyName === "deletedBy"
        ) {
            // For soft remove, we need to manually update the entity to persist the deletedBy field
            await event.manager
                .getRepository(event.metadata.target)
                .update({ id: event.entity.id }, { deletedBy: userId });
        }
    }
}
