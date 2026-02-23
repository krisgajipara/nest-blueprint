import {
    AuthRepository,
    AuthService,
    OtpRepository,
    ResetPasswordTokenRepository,
    TokenRepository
} from "@business-core-modules";
import { Otp, ResetPasswordToken, Token, User } from "@core-database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";

/**
 * Auth module for authentication-related functionality
 * Provides JWT authentication, OTP verification, and password management
 */
@Module({
    imports: [TypeOrmModule.forFeature([Otp, ResetPasswordToken, Token, User]), UserModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        OtpRepository,
        ResetPasswordTokenRepository,
        TokenRepository,
        TokenRepository
    ],
    exports: [AuthService] // ✅ Only export service
})
export class AuthModule { }
