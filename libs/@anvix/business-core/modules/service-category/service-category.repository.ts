import { ServiceCategory, TenantAwareRepository } from "@core-database";
import { SortDirection } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListServiceCategoryRequestDto } from "./dto/request/list-service-category.request.dto";

@Injectable({ scope: Scope.REQUEST })
export class ServiceCategoryRepository extends TenantAwareRepository<ServiceCategory> {
    constructor(
        @InjectRepository(ServiceCategory)
        repository: Repository<ServiceCategory>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async findByName(name: string): Promise<ServiceCategory | null> {
        return this.findOne({ where: { name } as any });
    }

    async findCategories(searchRequest: ListServiceCategoryRequestDto): Promise<[ServiceCategory[], number]> {
        const queryBuilder = this.createQueryBuilder("category");

        queryBuilder.select([
            "category.id",
            "category.name",
            "category.gender",
            "category.isActive",
            "category.createdAt",
            "category.updatedAt"
        ]);

        if (searchRequest.searchText) {
            queryBuilder.andWhere("category.name ILIKE :searchText", {
                searchText: `%${searchRequest.searchText}%`
            });
        }

        if (searchRequest.gender) {
            queryBuilder.andWhere("category.gender = :gender", { gender: searchRequest.gender });
        }

        if (searchRequest.isActive !== undefined) {
            queryBuilder.andWhere("category.isActive = :isActive", { isActive: searchRequest.isActive });
        }

        const SORT_MAP: Record<string, string> = {
            name: "category.name",
            gender: "category.gender",
            createdAt: "category.createdAt",
            updatedAt: "category.updatedAt"
        };

        const sortDirection = searchRequest.sortDirection || SortDirection.DESC;
        const orderBy = SORT_MAP[searchRequest.sortBy ?? ""] ?? "category.createdAt";
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
}
