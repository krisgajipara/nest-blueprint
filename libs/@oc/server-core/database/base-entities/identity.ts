import { BaseEntity, PrimaryGeneratedColumn } from "typeorm";

export class Identity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
}
