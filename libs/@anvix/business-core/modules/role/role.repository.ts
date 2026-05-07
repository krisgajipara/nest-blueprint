import { Role, TenantAwareRepository } from "@core-database";
import { SortDirection, SystemRoleType } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListRoleRequestDto } from "./dto/request/list-role.request.dto";

/**
 * Role repository for role management operations
 * Simplified approach: User has roleId, Role stores permissions as JSON
 */
@Injectable({ scope: Scope.REQUEST })
export class RoleRepository extends TenantAwareRepository<Role> {
    constructor(
        @InjectRepository(Role)
        repository: Repository<Role>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    // Role operations
    async findRoleById(id: string): Promise<Role | null> {
        return this.findOne({
            where: { id, isActive: true } as any
        });
    }

    async findRoleByName(name: string): Promise<Role | null> {
        return this.findOne({
            where: { name, isActive: true } as any
        });
    }

    async findAllRoles(): Promise<Role[]> {
        return this.find({
            where: { isActive: true } as any
        });
    }

    /**
     * Find roles with search, filter, pagination, and sorting
     * @param searchRequest - List role request parameters
     * @returns Promise of roles array and total count
     */
    async findRoles(searchRequest: ListRoleRequestDto): Promise<[Role[], number]> {
        const queryBuilder = this.createQueryBuilder("role");

        // Select role fields (without permissions for performance)
        queryBuilder.select([
            "role.id",
            "role.name",
            "role.description",
            "role.systemRoleType",
            "role.isActive",
            "role.createdAt",
            "role.updatedAt"
        ]);

        // Only active roles
        queryBuilder.andWhere("role.isActive = :isActive", { isActive: true });

        // Apply search filter on name and description
        if (searchRequest.searchText) {
            queryBuilder.andWhere("(role.name ILIKE :searchText OR role.description ILIKE :searchText)", {
                searchText: `%${searchRequest.searchText}%`
            });
        }

        // Apply sorting
        const SORT_MAP: Record<string, string> = {
            name: "role.name",
            description: "role.description",
            updatedAt: "role.updatedAt"
        };

        const orderDirection = searchRequest.sortDirection || SortDirection.DESC;
        const orderBy = SORT_MAP[searchRequest.sortBy] ?? "role.createdAt";
        queryBuilder.orderBy(orderBy, orderDirection);

        // Apply pagination
        const pageSize = searchRequest.pageSize || 10;
        const pageNumber = searchRequest.pageNumber || 1;
        const offset = (pageNumber - 1) * pageSize;
        if (pageNumber == 0 && pageSize == 0) {
            return queryBuilder.getManyAndCount();
        }

        queryBuilder.skip(offset).take(pageSize);

        return queryBuilder.getManyAndCount();
    }

    /**
     * Find roles for dropdown with search, filter, pagination, and sorting
     * Excludes SUPER_ADMIN role from dropdown unless includeSuperAdminRoles is true
     * @param searchRequest - List role request parameters
     * @param includeSuperAdminRoles - Whether to include SUPER_ADMIN roles (default: false)
     * @returns Promise of roles array and total count
     */
    async findDropdown(searchRequest: ListRoleRequestDto, includeSuperAdminRoles: boolean = false): Promise<[Role[], number]> {
        const queryBuilder = this.createQueryBuilder("role");

        // Select role fields (without permissions for performance)
        queryBuilder.select(["role.id", "role.name"]);

        // Only active roles
        queryBuilder.andWhere("role.isActive = :isActive", { isActive: true });

        // Exclude SUPER_ADMIN unless explicitly requested
        if (!includeSuperAdminRoles) {
            queryBuilder.andWhere("role.systemRoleType != :superAdmin OR role.systemRoleType IS NULL", {
                superAdmin: SystemRoleType.SUPER_ADMIN
            });
        }

        // Apply search filter on name and description
        if (searchRequest.searchText) {
            queryBuilder.andWhere("(role.name ILIKE :searchText OR role.description ILIKE :searchText)", {
                searchText: `%${searchRequest.searchText}%`
            });
        }

        // Apply sorting
        const orderDirection = searchRequest.sortDirection || SortDirection.ASC;

        queryBuilder.orderBy("role.name", orderDirection);

        // Apply pagination
        const pageSize = searchRequest.pageSize || 10;
        const pageNumber = searchRequest.pageNumber || 1;
        const offset = (pageNumber - 1) * pageSize;
        if (pageNumber == 0 && pageSize == 0) {
            return queryBuilder.getManyAndCount();
        }

        queryBuilder.skip(offset).take(pageSize);

        return queryBuilder.getManyAndCount();
    }

}
