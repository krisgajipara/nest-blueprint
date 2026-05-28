import { Service, ServiceStaffMapping, TenantAwareRepository } from "@core-database";
import { SortDirection } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListServiceRequestDto } from "./dto/request/list-service.request.dto";

@Injectable({ scope: Scope.REQUEST })
export class ServiceRepository extends TenantAwareRepository<Service> {
    constructor(
        @InjectRepository(Service)
        repository: Repository<Service>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async findByCategoryAndName(categoryId: string, name: string): Promise<Service | null> {
        return this.findOne({ where: { categoryId, name } as any });
    }

    async findServices(searchRequest: ListServiceRequestDto): Promise<[Service[], number]> {
        const queryBuilder = this.createQueryBuilder("service");
        queryBuilder.leftJoinAndSelect("service.category", "category");

        queryBuilder.select([
            "service.id",
            "service.categoryId",
            "service.name",
            "service.description",
            "service.price",
            "service.durationMin",
            "service.image",
            "service.isActive",
            "service.createdAt",
            "service.updatedAt",
            "category.id",
            "category.name",
            "category.gender"
        ]);

        if (searchRequest.searchText) {
            queryBuilder.andWhere("service.name ILIKE :searchText", {
                searchText: `%${searchRequest.searchText}%`
            });
        }

        if (searchRequest.categoryId) {
            queryBuilder.andWhere("service.categoryId = :categoryId", { categoryId: searchRequest.categoryId });
        }

        if (searchRequest.gender) {
            queryBuilder.andWhere("category.gender = :gender", { gender: searchRequest.gender });
        }

        if (searchRequest.isActive !== undefined) {
            queryBuilder.andWhere("service.isActive = :isActive", { isActive: searchRequest.isActive });
        }

        if (searchRequest.staffId || searchRequest.staffSearchText) {
            queryBuilder.innerJoin(
                ServiceStaffMapping,
                "staffMapping",
                "staffMapping.serviceId = service.id"
            );
            queryBuilder.innerJoin("staffMapping.staff", "assignedStaff");

            if (searchRequest.staffId) {
                queryBuilder.andWhere("staffMapping.staffId = :staffId", { staffId: searchRequest.staffId });
            }

            if (searchRequest.staffSearchText) {
                queryBuilder.andWhere(
                    "(assignedStaff.firstName ILIKE :staffSearch OR assignedStaff.lastName ILIKE :staffSearch OR CONCAT(assignedStaff.firstName, ' ', assignedStaff.lastName) ILIKE :staffSearch)",
                    { staffSearch: `%${searchRequest.staffSearchText}%` }
                );
            }

            if (searchRequest.assignmentIsActive !== undefined) {
                queryBuilder.andWhere("staffMapping.isActive = :assignmentIsActive", {
                    assignmentIsActive: searchRequest.assignmentIsActive
                });
            }
        }

        const SORT_MAP: Record<string, string> = {
            name: "service.name",
            price: "service.price",
            durationMin: "service.durationMin",
            createdAt: "service.createdAt",
            updatedAt: "service.updatedAt"
        };

        const sortDirection = searchRequest.sortDirection || SortDirection.DESC;
        const orderBy = SORT_MAP[searchRequest.sortBy ?? ""] ?? "service.createdAt";
        queryBuilder.orderBy(orderBy, sortDirection);

        const pageSize = searchRequest.pageSize || 10;
        const pageNumber = searchRequest.pageNumber || 1;
        const offset = (pageNumber - 1) * pageSize;

        if (pageNumber === 0 && pageSize === 0) {
            return queryBuilder.getManyAndCount();
        }

        queryBuilder.skip(offset).take(pageSize);
        return queryBuilder.getManyAndCount();
    }

    async deactivateByCategoryId(categoryId: string): Promise<void> {
        await this.createQueryBuilder("service")
            .update(Service)
            .set({ isActive: false })
            .where("service.categoryId = :categoryId", { categoryId })
            .execute();
    }
}
