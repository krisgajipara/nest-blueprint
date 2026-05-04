import { DatabaseUniqueKey, UserEntityConstant } from "@core-constants";
import { UserStatus, UserTypeEnum } from "@core-enums";
import * as bcrypt from "bcrypt";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

import { BaseTenantModifiableEntityWithoutIdentity } from "../base-entities/base-tenant-modifiable-without-identity-entity";
import { Role as RoleEntity } from "./role.entity";

/**
 * User entity representing user accounts in the system
 */
@Entity("user")
@Unique(DatabaseUniqueKey.UserEmailUserType, ["email", "userType", "deletedAt"])
export class User extends BaseTenantModifiableEntityWithoutIdentity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        length: UserEntityConstant.FirstNameMaxLength,
        name: "first_name",
        nullable: false
    })
    firstName: string;

    @Column({
        type: "varchar",
        length: UserEntityConstant.LastNameMaxLength,
        name: "last_name",
        nullable: false
    })
    lastName: string;

    @Column({
        type: "varchar",
        length: UserEntityConstant.EmailMaxLength,
        name: "email",
        nullable: false
    })
    email: string;

    @Column({
        type: "varchar",
        length: UserEntityConstant.EncryptedPasswordMaxLength,
        name: "password",
        nullable: true
    })
    password: string | null;

    @Column({
        type: "varchar",
        length: UserEntityConstant.SaltMaxLength,
        name: "salt",
        nullable: true
    })
    salt: string | null;

    @Column({
        type: "varchar",
        length: UserEntityConstant.PhoneNumberMaxLength,
        name: "phone_number",
        nullable: true
    })
    phoneNumber: string | null;

    @Column({
        type: "date",
        name: "date_of_birth",
        nullable: true
    })
    dateOfBirth: Date | null;

    @Column({
        type: "enum",
        enum: UserTypeEnum,
        name: "user_type",
        nullable: false,
        default: UserTypeEnum.USER
    })
    userType: UserTypeEnum;

    @Column({
        type: "enum",
        enum: UserStatus,
        name: "status",
        nullable: false,
        default: UserStatus.ACTIVE
    })
    status: UserStatus;

    /**
     * Many-to-one relationship with Role
     * A user can have one role assigned
     */
    @ManyToOne(() => RoleEntity, { nullable: true })
    @JoinColumn({ name: "role_id" })
    role: RoleEntity | null;

    @Column({
        type: "uuid",
        name: "role_id",
        nullable: true
    })
    roleId: string | null;

    /**
     * Hash password before inserting to database
     */
    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, this.salt);
        }
    }

    /**
     * Validate password against stored hash
     * @param password - Plain text password to validate
     * @returns Promise<boolean> - True if password is valid
     */
    async validatePassword(password: string): Promise<boolean> {
        if (!this.password || !this.salt) {
            return false;
        }
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }

    /**
     * Update password with new salt
     * @param newPassword - New plain text password
     */
    async updatePassword(newPassword: string): Promise<void> {
        this.salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(newPassword, this.salt);
    }
}
