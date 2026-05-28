import { TenantAwareRepository, User } from "@core-database";
import { SortDirection, UserStatus, UserTypeEnum } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListUserRequestDto } from "./dto/request/list-user.request.dto";

/**
 * Repository class for User entity operations
 * Handles database queries and complex filtering/pagination logic
 */
@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends TenantAwareRepository<User> {
    constructor(
        @InjectRepository(User)
        repository: Repository<User>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    /**
     * Find users with search, filter, pagination, and sorting
     * @param searchRequest - List user request parameters
     * @returns Promise of users array and total count
     */
    async findUsers(searchRequest: ListUserRequestDto): Promise<[User[], number]> {
        const qb = this.createQueryBuilder("user").select([
            "user.id",
            "user.firstName",
            "user.lastName",
            "user.phoneNumber",
            "user.userType",
            "user.status",
            "user.createdAt",
            "user.dateOfBirth"
        ]);

        // Filters
        if (searchRequest.userType) {
            qb.andWhere("user.userType = :userType", { userType: searchRequest.userType });
        }

        if (searchRequest.status) {
            qb.andWhere("user.status = :status", { status: searchRequest.status });
        }

        if (searchRequest.searchText) {
            qb.andWhere(
                "(user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.email ILIKE :q OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :q)",
                {
                    q: `%${searchRequest.searchText}%`
                }
            );
        }

        // Whitelisted sortable fields
        const SORT_MAP: Record<string, string> = {
            firstName: "user.firstName",
            lastName: "user.lastName",
            email: "user.email",
            createdAt: "user.createdAt",
            updatedAt: "user.updatedAt"
        };

        // Resolve field safely
        const orderByField = SORT_MAP[searchRequest.sortBy] ?? "user.createdAt";

        // Resolve direction safely
        const sortDirection =
            searchRequest.sortDirection === SortDirection.ASC ? SortDirection.ASC : SortDirection.DESC;

        // Apply order
        qb.orderBy(orderByField, sortDirection);

        const pageSize = searchRequest.pageSize || 10;
        const pageNumber = searchRequest.pageNumber || 1;
        const offset = (pageNumber - 1) * pageSize;

        // Normal paginated case
        if (!(pageNumber === 0 && pageSize === 0)) {
            qb.skip(offset).take(pageSize);
        }

        return qb.getManyAndCount();
    }

    /**
     * Find user by email and optionally by userType
     * @param email - User email
     * @param userType - Optional user type to filter by
     * @returns Promise of User or null
     */
    async findByEmail(email: string, userType?: UserTypeEnum): Promise<User | null> {
        const queryBuilder = this.createQueryBuilder("user")
            .select([
                "user.id",
                "user.firstName",
                "user.lastName",
                "user.email",
                "user.password",
                "user.salt",
                "user.phoneNumber",
                "user.dateOfBirth",
                "user.userType",
                "user.status",
                "user.roleId"
            ])
            .andWhere("user.email = :email", { email });

        // Filter by userType if provided to handle multiple userTypes per email
        if (userType !== undefined) {
            queryBuilder.andWhere("user.userType = :userType", { userType });
        }

        return queryBuilder.getOne();
    }

    /**
     * Find user by ID
     * @param id - User ID
     * @returns Promise of User or null
     */
    async findByIdsWithRole(ids: string[]): Promise<User[]> {
        if (!ids.length) {
            return [];
        }

        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .select([
                "user.id",
                "user.firstName",
                "user.lastName",
                "user.email",
                "user.userType",
                "user.status",
                "role.id",
                "role.systemRoleType"
            ])
            .andWhere("user.id IN (:...ids)", { ids })
            .getMany();
    }

    async findById(id: string): Promise<User | null> {
        return this.createQueryBuilder("user")
            .select([
                "user.id",
                "user.firstName",
                "user.lastName",
                "user.email",
                "user.password",
                "user.salt",
                "user.phoneNumber",
                "user.dateOfBirth",
                "user.userType",
                "user.status",
                "user.createdAt",
                "user.updatedAt"
            ])
            .andWhere("user.id = :id", { id })
            .getOne();
    }

    /**
     * Find users by email
     * Returns a map of email to user.id
     * @param emails - Array of email strings to look up
     * @returns Promise of Map<string, string> where key is email and value is user.id
     */
    async findByEmails(emails: string[]): Promise<Map<string, string>> {
        const users = await this.createQueryBuilder("user")
            .select(["user.id", "user.email"])
            .andWhere("user.email IN (:...emails)", { emails })
            .getMany();

        const emailIdMap = new Map<string, string>();
        for (const user of users) {
            if (user.email) {
                emailIdMap.set(user.email, user.id);
            }
        }

        return emailIdMap;
    }

    /**
     * Find users for dropdown with selective field fetching
     * @param searchRequest - Dropdown request parameters
     * @returns Promise of users array and total count with id and computed name
     */
    async findDropdown(searchRequest: any): Promise<[Array<{ id: string; name: string }>, number]> {
        const qb = this.createQueryBuilder("user")
            .select(["user.id AS id", "CONCAT(user.firstName, ' ', user.lastName) AS name"])
            .andWhere("user.status = :status", { status: UserStatus.ACTIVE })
            .orderBy("user.firstName", SortDirection.ASC);

        // Filter by userType
        if (searchRequest.userType) {
            qb.andWhere("user.userType = :userType", {
                userType: searchRequest.userType
            });
        }

        // Search filter
        if (searchRequest.searchText) {
            qb.andWhere(
                `(user.firstName ILIKE :q
          OR user.lastName ILIKE :q
          OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :q)`,
                { q: `%${searchRequest.searchText}%` }
            );
        }

        const pageSize = searchRequest.pageSize ?? 10;
        const pageNumber = searchRequest.pageNumber ?? 1;

        // No pagination (fetch all)
        if (pageSize === 0 && pageNumber === 0) {
            const users = await qb.getRawMany();
            const total = await qb.getCount();
            return [users, total];
        }

        qb.skip((pageNumber - 1) * pageSize).take(pageSize);

        const users = await qb.getRawMany();
        const total = await qb.getCount();

        return [users, total];
    }
}
