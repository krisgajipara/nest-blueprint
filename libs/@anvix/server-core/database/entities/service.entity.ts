import { DatabaseUniqueKey, ServiceEntityConstant } from "@core-constants";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { ServiceCategory } from "./service-category.entity";

@Entity("service")
@Unique(DatabaseUniqueKey.ServiceTenantCategoryName, ["tenantId", "categoryId", "name", "deletedAt"])
export class Service extends BaseTenantModifiableEntity {
    @Column({
        type: "uuid",
        name: "category_id",
        nullable: false
    })
    categoryId: string;

    @ManyToOne(() => ServiceCategory, (category) => category.services, { nullable: false })
    @JoinColumn({ name: "category_id" })
    category: ServiceCategory;

    @Column({
        type: "varchar",
        length: ServiceEntityConstant.NameMaxLength,
        name: "name",
        nullable: false
    })
    name: string;

    @Column({
        type: "text",
        name: "description",
        nullable: true
    })
    description: string | null;

    @Column({
        type: "decimal",
        precision: 12,
        scale: 2,
        name: "price",
        nullable: false
    })
    price: number;

    @Column({
        type: "int",
        name: "duration_min",
        nullable: false
    })
    durationMin: number;

    @Column({
        type: "varchar",
        length: ServiceEntityConstant.ImageMaxLength,
        name: "image",
        nullable: true
    })
    image: string | null;

    @Column({
        type: "boolean",
        name: "is_active",
        default: true
    })
    isActive: boolean;
}
