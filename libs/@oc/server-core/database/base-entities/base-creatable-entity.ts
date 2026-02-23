import { Column, CreateDateColumn } from "typeorm";
import { Identity } from "./identity";

export class BaseCreatableEntity extends Identity {
    @Column({ type: "uuid", name: "created_by", nullable: true })
    createdBy: string;

    @CreateDateColumn({
        type: "timestamp with time zone",
        name: "created_at",
        nullable: true
    })
    createdAt: Date;
}
