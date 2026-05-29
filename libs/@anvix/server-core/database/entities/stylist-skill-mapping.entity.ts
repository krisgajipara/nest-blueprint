import { DatabaseUniqueKey } from "@core-constants";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { Skill } from "./skill.entity";
import { User } from "./user.entity";

@Entity("stylist_skill_mapping")
@Unique(DatabaseUniqueKey.StylistSkillMappingTenantStylistSkill, [
    "tenantId",
    "stylistId",
    "skillId",
    "deletedAt"
])
export class StylistSkillMapping extends BaseTenantModifiableEntity {
    @Column({ type: "uuid", name: "stylist_id", nullable: false })
    stylistId: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "stylist_id" })
    stylist: User;

    @Column({ type: "uuid", name: "skill_id", nullable: false })
    skillId: string;

    @ManyToOne(() => Skill, { nullable: false })
    @JoinColumn({ name: "skill_id" })
    skill: Skill;
}
