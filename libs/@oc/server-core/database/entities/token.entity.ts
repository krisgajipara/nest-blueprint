import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseModifiableEntityWithoutIdentity } from "../base-entities/base-modifiable-without-identity-entity";
import { User } from "./user.entity";

/**
 * Token entity for storing JWT access and refresh tokens
 */
@Entity("token")
export class Token extends BaseModifiableEntityWithoutIdentity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        name: "user_id",
        nullable: false
    })
    userId: string;

    @Column({
        type: "text",
        name: "access_token",
        nullable: false
    })
    accessToken: string;

    @Column({
        type: "text",
        name: "refresh_token",
        nullable: false
    })
    refreshToken: string;

    @Column({
        type: "boolean",
        name: "remember_me",
        default: false,
        nullable: false
    })
    rememberMe: boolean;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @CreateDateColumn({
        type: "timestamp with time zone",
        name: "created_at",
        nullable: true
    })
    createdAt: Date;

    @BeforeInsert()
    setUserId() {
        if (this.user) {
            this.userId = this.user.id;
        }
    }
}
