import { DatabaseUniqueKey } from "@core-constants";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { Service } from "./service.entity";
import { Skill } from "./skill.entity";

@Entity("service_skill_mapping")
@Unique(DatabaseUniqueKey.ServiceSkillMappingTenantServiceSkill, [
    "tenantId",
    "serviceId",
    "skillId",
    "deletedAt"
])
export class ServiceSkillMapping extends BaseTenantModifiableEntity {
    @Column({ type: "uuid", name: "service_id", nullable: false })
    serviceId: string;

    @ManyToOne(() => Service, { nullable: false })
    @JoinColumn({ name: "service_id" })
    service: Service;

    @Column({ type: "uuid", name: "skill_id", nullable: false })
    skillId: string;

    @ManyToOne(() => Skill, { nullable: false })
    @JoinColumn({ name: "skill_id" })
    skill: Skill;
}
