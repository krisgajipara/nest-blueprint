import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";
import { Identity } from "./identity";

export class BaseModifiableEntity extends Identity {
    @Column({ type: "uuid", name: "created_by", nullable: true })
    createdBy: string;

    @Column({ type: "uuid", name: "updated_by", nullable: true })
    updatedBy: string;

    @Column({ type: "uuid", name: "deleted_by", nullable: true })
    deletedBy: string;

    @CreateDateColumn({
        type: "timestamp with time zone",
        name: "created_at",
        nullable: true
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp with time zone",
        name: "updated_at",
        nullable: true
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: "timestamp with time zone",
        name: "deleted_at",
        nullable: true
    })
    deletedAt: Date;
}
