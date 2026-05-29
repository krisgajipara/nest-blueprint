import { StylistSkillMapping, TenantAwareRepository } from "@core-database";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class StylistSkillMappingRepository extends TenantAwareRepository<StylistSkillMapping> {
    constructor(
        @InjectRepository(StylistSkillMapping)
        repository: Repository<StylistSkillMapping>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async countBySkillId(skillId: string): Promise<number> {
        return this.count({ where: { skillId } as any });
    }

    async findByStylistId(stylistId: string): Promise<StylistSkillMapping[]> {
        return this.createQueryBuilder("mapping")
            .leftJoinAndSelect("mapping.skill", "skill")
            .select([
                "mapping.id",
                "mapping.stylistId",
                "mapping.skillId",
                "skill.id",
                "skill.name",
                "skill.isActive"
            ])
            .andWhere("mapping.stylistId = :stylistId", { stylistId })
            .orderBy("skill.name", "ASC")
            .getMany();
    }

    async findByStylistIds(stylistIds: string[]): Promise<StylistSkillMapping[]> {
        if (!stylistIds.length) {
            return [];
        }

        return this.createQueryBuilder("mapping")
            .leftJoinAndSelect("mapping.skill", "skill")
            .select([
                "mapping.id",
                "mapping.stylistId",
                "mapping.skillId",
                "skill.id",
                "skill.name",
                "skill.isActive"
            ])
            .andWhere("mapping.stylistId IN (:...stylistIds)", { stylistIds })
            .orderBy("skill.name", "ASC")
            .getMany();
    }
}
