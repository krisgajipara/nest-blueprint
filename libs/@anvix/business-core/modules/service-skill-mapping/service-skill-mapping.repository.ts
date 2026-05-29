import { ServiceSkillMapping, TenantAwareRepository } from "@core-database";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class ServiceSkillMappingRepository extends TenantAwareRepository<ServiceSkillMapping> {
    constructor(
        @InjectRepository(ServiceSkillMapping)
        repository: Repository<ServiceSkillMapping>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async countBySkillId(skillId: string): Promise<number> {
        return this.count({ where: { skillId } as any });
    }

    async findByServiceId(serviceId: string): Promise<ServiceSkillMapping[]> {
        return this.createQueryBuilder("mapping")
            .leftJoinAndSelect("mapping.skill", "skill")
            .select([
                "mapping.id",
                "mapping.serviceId",
                "mapping.skillId",
                "skill.id",
                "skill.name",
                "skill.isActive"
            ])
            .andWhere("mapping.serviceId = :serviceId", { serviceId })
            .orderBy("skill.name", "ASC")
            .getMany();
    }

    async findByServiceIds(serviceIds: string[]): Promise<ServiceSkillMapping[]> {
        if (!serviceIds.length) {
            return [];
        }

        return this.createQueryBuilder("mapping")
            .leftJoinAndSelect("mapping.skill", "skill")
            .select([
                "mapping.id",
                "mapping.serviceId",
                "mapping.skillId",
                "skill.id",
                "skill.name",
                "skill.isActive"
            ])
            .andWhere("mapping.serviceId IN (:...serviceIds)", { serviceIds })
            .orderBy("skill.name", "ASC")
            .getMany();
    }
}
