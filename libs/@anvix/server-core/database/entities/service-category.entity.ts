import { DatabaseUniqueKey, ServiceCategoryEntityConstant } from "@core-constants";
import { ServiceGenderEnum } from "@core-enums";
import { Column, Entity, OneToMany, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { Service } from "./service.entity";

@Entity("service_category")
@Unique(DatabaseUniqueKey.ServiceCategoryTenantName, ["tenantId", "name", "deletedAt"])
export class ServiceCategory extends BaseTenantModifiableEntity {
    @Column({
        type: "varchar",
        length: ServiceCategoryEntityConstant.NameMaxLength,
        name: "name",
        nullable: false
    })
    name: string;

    @Column({
        type: "enum",
        enum: ServiceGenderEnum,
        name: "gender",
        nullable: false
    })
    gender: ServiceGenderEnum;

    @Column({
        type: "boolean",
        name: "is_active",
        default: true
    })
    isActive: boolean;

    @OneToMany(() => Service, (service) => service.category)
    services: Service[];
}
