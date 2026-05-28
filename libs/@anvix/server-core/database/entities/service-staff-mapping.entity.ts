import { DatabaseUniqueKey } from "@core-constants";
import { StaffSkillLevelEnum } from "@core-enums";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { Service } from "./service.entity";
import { User } from "./user.entity";

@Entity("service_staff_mapping")
@Unique(DatabaseUniqueKey.ServiceStaffMappingTenantServiceStaff, [
    "tenantId",
    "serviceId",
    "staffId",
    "deletedAt"
])
export class ServiceStaffMapping extends BaseTenantModifiableEntity {
    @Column({ type: "uuid", name: "service_id", nullable: false })
    serviceId: string;

    @ManyToOne(() => Service, { nullable: false })
    @JoinColumn({ name: "service_id" })
    service: Service;

    @Column({ type: "uuid", name: "staff_id", nullable: false })
    staffId: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "staff_id" })
    staff: User;

    @Column({
        type: "enum",
        enum: StaffSkillLevelEnum,
        name: "skill_level",
        nullable: false
    })
    skillLevel: StaffSkillLevelEnum;

    @Column({ type: "boolean", name: "is_active", default: true })
    isActive: boolean;
}
