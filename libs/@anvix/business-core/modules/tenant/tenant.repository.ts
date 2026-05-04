import { CommonDropdownRequestDto } from "@business-core-dto";
import { Tenant, TenantAwareRepository } from "@core-database";
import { SortDirection, TenantStatus } from "@core-enums";
import { RequestContextService } from "@core-shared-modules";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListTenantRequestDto } from "./dto/request/list-tenant.request.dto";

/**
 * Tenant repository for tenant management operations
 * Handles database queries for tenant CRUD and listing
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantRepository extends TenantAwareRepository<Tenant> {
    constructor(
        @InjectRepository(Tenant)
        repository: Repository<Tenant>,
        @Inject() requestContextService: RequestContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }

    /**
     * Find tenant by subdomain
     * @param subdomain - Tenant subdomain
     * @returns Promise of Tenant or null
     */
    async findBySubdomain(subdomain: string): Promise<Tenant | null> {
        return this.findOne({
            where: { subdomain, status: TenantStatus.ACTIVE }
        });
    }

    /**
     * Find tenants with search, filter, pagination, and sorting
     * @param searchRequest - List tenant request parameters
     * @returns Promise of tenants array and total count
     */
    async findTenants(searchRequest: ListTenantRequestDto): Promise<[Tenant[], number]> {
        const queryBuilder = this.createQueryBuilder("tenant");

        // Select tenant fields
        queryBuilder.select([
            "tenant.id",
            "tenant.name",
            "tenant.subdomain",
            "tenant.config",
            "tenant.status",
            "tenant.createdAt",
            "tenant.updatedAt"
        ]);

        // Apply filters
        if (searchRequest.status) {
            queryBuilder.andWhere("tenant.status = :status", { status: searchRequest.status });
        }

        if (searchRequest.searchText) {
            queryBuilder.andWhere("(tenant.name ILIKE :searchText OR tenant.subdomain ILIKE :searchText)", {
                searchText: `%${searchRequest.searchText}%`
            });
        }

        // Apply sorting
        const orderDirection = searchRequest.sortDirection || SortDirection.DESC;

        // Whitelisted sortable fields
        const SORT_MAP: Record<string, string> = {
            name: "tenant.name",
            subdomain: "tenant.subdomain",
            status: "tenant.status",
            createdAt: "tenant.createdAt"
        };

        // Resolve field safely
        const orderByField = SORT_MAP[searchRequest.sortBy] ?? "tenant.createdAt";

        queryBuilder.orderBy(orderByField, orderDirection);

        // Apply pagination
        const pageSize = searchRequest.pageSize || 10;
        const pageNumber = searchRequest.pageNumber || 1;
        const offset = (pageNumber - 1) * pageSize;

        if (!(pageNumber == 0 && pageSize == 0)) {
            queryBuilder.skip(offset).take(pageSize);
        }

        return queryBuilder.getManyAndCount();
    }

    /**
     * Find active tenants for dropdown with search and pagination
     * @param searchRequest - Dropdown request parameters
     * @returns Promise of raw results array and total count
     */
    async findDropdownTenants(searchRequest: CommonDropdownRequestDto): Promise<[Tenant[], number]> {
        const queryBuilder = this.createQueryBuilder("tenant")
            .select(["tenant.id AS tenant_id", "tenant.name AS tenant_name", "tenant.logo AS tenant_logo"])
            .where("tenant.status = :status", { status: TenantStatus.ACTIVE });

        if (searchRequest.searchText) {
            queryBuilder.andWhere("(tenant.name ILIKE :searchText OR tenant.subdomain ILIKE :searchText)", {
                searchText: `%${searchRequest.searchText}%`
            });
        }
        return queryBuilder.getManyAndCount();
    }
}
