import { Tenant } from "@core-database";
import { SortDirection, TenantStatus } from "@core-enums";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListTenantRequestDto } from "./dto/request/list-tenant.request.dto";

/**
 * Interface for dropdown tenant result with in-review assessment cycles count
 */
export interface TenantDropdownResult extends Tenant {
  totalInReviewAssessmentCycles?: number;
}

@Injectable()
export class TenantRepository extends Repository<Tenant> {
  constructor(
    @InjectRepository(Tenant)
    public readonly tenantRepository: Repository<Tenant>,
  ) {
    super(
      tenantRepository.target,
      tenantRepository.manager,
      tenantRepository.queryRunner,
    );
  }

  /**
   * Find tenant by subdomain
   * @param subdomain - Tenant subdomain
   * @returns Promise of Tenant or null
   */
  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { subdomain, status: TenantStatus.ACTIVE },
    });
  }

  /**
   * Find tenants with search, filter, pagination, and sorting
   * @param searchRequest - List tenant request parameters
   * @returns Promise of tenants array and total count
   */
  async findTenants(
    searchRequest: ListTenantRequestDto,
  ): Promise<[Tenant[], number]> {
    const queryBuilder = this.createQueryBuilder("tenant");

    // Select tenant fields
    queryBuilder.select([
      "tenant.id",
      "tenant.name",
      "tenant.subdomain",
      "tenant.config",
      "tenant.status",
      "tenant.createdAt",
      "tenant.updatedAt",
    ]);

    // Apply filters
    if (searchRequest.status) {
      queryBuilder.andWhere("tenant.status = :status", {
        status: searchRequest.status,
      });
    }

    if (searchRequest.searchText) {
      queryBuilder.andWhere(
        "(tenant.name ILIKE :searchText OR tenant.subdomain ILIKE :searchText)",
        {
          searchText: `%${searchRequest.searchText}%`,
        },
      );
    }

    // Apply sorting
    const orderDirection = searchRequest.sortDirection || SortDirection.DESC;

    // Whitelisted sortable fields
    const SORT_MAP: Record<string, string> = {
      name: "tenant.name",
      subdomain: "tenant.subdomain",
      status: "tenant.status",
      createdAt: "tenant.createdAt",
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
}
