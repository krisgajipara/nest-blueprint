import { DatabaseUniqueKey, SkillEntityConstant } from "@core-constants";
import { Column, Entity, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";

@Entity("skill")
@Unique(DatabaseUniqueKey.SkillTenantName, ["tenantId", "name", "deletedAt"])
export class Skill extends BaseTenantModifiableEntity {
    @Column({
        type: "varchar",
        length: SkillEntityConstant.NameMaxLength,
        name: "name",
        nullable: false
    })
    name: string;

    @Column({
        type: "varchar",
        length: SkillEntityConstant.DescriptionMaxLength,
        name: "description",
        nullable: true
    })
    description: string | null;

    @Column({
        type: "boolean",
        name: "is_active",
        default: true
    })
    isActive: boolean;
}
