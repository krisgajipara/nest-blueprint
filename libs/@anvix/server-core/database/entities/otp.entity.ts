import { BaseTenantModifiableEntity } from "../base-entities/base-tenant-modifiable-entity";
import { OtpType } from "@core-enums";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

/**
 * OTP entity for storing verification codes
 */
@Entity("otp")
export class Otp extends BaseTenantModifiableEntity {
    @Column({
        type: "varchar",
        length: 6,
        name: "otp_code",
        nullable: false
    })
    otpCode: string;

    @Column({
        type: "enum",
        enum: OtpType,
        name: "otp_type",
        nullable: false
    })
    otpType: OtpType;

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
        name: "user_id",
        nullable: false
    })
    userId: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;
}
