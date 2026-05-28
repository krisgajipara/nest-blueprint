import { DEFAULT_SERVICE_CATALOG } from "@core-constants";
import { Service, ServiceCategory } from "@core-database";
import { EntityManager } from "typeorm";

/**
 * Seeds default service categories and sample services for a new tenant
 */
export async function seedServiceCatalogForTenant(manager: EntityManager, tenantId: string): Promise<void> {
    for (const categorySeed of DEFAULT_SERVICE_CATALOG) {
        const category = manager.create(ServiceCategory, {
            name: categorySeed.name,
            gender: categorySeed.gender,
            isActive: true,
            tenantId
        });
        const savedCategory = await manager.save(category);

        if (!categorySeed.services.length) {
            continue;
        }

        const services = categorySeed.services.map((serviceSeed) =>
            manager.create(Service, {
                categoryId: savedCategory.id,
                name: serviceSeed.name,
                description: serviceSeed.description ?? null,
                price: serviceSeed.price,
                durationMin: serviceSeed.durationMin,
                isActive: true,
                tenantId
            })
        );

        await manager.save(services);
    }
}
