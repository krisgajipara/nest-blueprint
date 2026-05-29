import { Skill, TenantAwareRepository } from "@core-database";
import { SortDirection } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ListSkillRequestDto } from "./dto/request/list-skill.request.dto";

@Injectable({ scope: Scope.REQUEST })
export class SkillRepository extends TenantAwareRepository<Skill> {
    constructor(
        @InjectRepository(Skill)
        repository: Repository<Skill>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async findByName(name: string): Promise<Skill | null> {
        return this.findOne({ where: { name } as any });
    }

    async findByIds(ids: string[]): Promise<Skill[]> {
        if (!ids.length) {
            return [];
        }
        return this.find({ where: { id: In(ids) } as any });
    }

    async findSkills(searchRequest: ListSkillRequestDto): Promise<[Skill[], number]> {
        const queryBuilder = this.createQueryBuilder("skill");
        queryBuilder.select([
            "skill.id",
            "skill.name",
            "skill.description",
            "skill.isActive",
            "skill.createdAt",
            "skill.updatedAt"
        ]);

        if (searchRequest.searchText) {
            queryBuilder.andWhere(
                "(skill.name ILIKE :searchText OR skill.description ILIKE :searchText)",
                { searchText: `%${searchRequest.searchText}%` }
            );
        }

        if (searchRequest.isActive !== undefined) {
            queryBuilder.andWhere("skill.isActive = :isActive", { isActive: searchRequest.isActive });
        }

        const SORT_MAP: Record<string, string> = {
            name: "skill.name",
            createdAt: "skill.createdAt",
            updatedAt: "skill.updatedAt"
        };

        const sortDirection = searchRequest.sortDirection || SortDirection.DESC;
        const orderBy = SORT_MAP[searchRequest.sortBy ?? ""] ?? "skill.name";
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
