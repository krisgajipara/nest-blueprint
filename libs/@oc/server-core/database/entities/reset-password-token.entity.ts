import { BaseModifiableEntity } from "../base-entities/base-modifiable-entity";
import { User } from "./user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

/**
 * ResetPasswordToken entity for storing password reset tokens
 */
@Entity("reset_password_token")
export class ResetPasswordToken extends BaseModifiableEntity {
    @Column({
        type: "varchar",
        length: 255,
        name: "reset_token",
        nullable: false
    })
    resetToken: string;

    @Column({
        type: "varchar",
        name: "user_id",
        nullable: false
    })
    userId: string;

    @Column({
        type: "timestamp",
        name: "expire_at",
        nullable: false
    })
    expireAt: Date;

    @Column({
        type: "boolean",
        name: "is_used",
        nullable: false,
        default: false
    })
    isUsed: boolean;

    @Column({
        type: "varchar",
        length: 50,
        name: "platform",
        nullable: false
    })
    platform: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;
}
