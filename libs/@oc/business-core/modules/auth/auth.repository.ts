import { Injectable } from "@nestjs/common";
import { Otp, ResetPasswordToken, Token } from "@core-database";
import { SortDirection, OtpType } from "@core-enums";
import { OtpRepository } from "./otp.repository";
import { ResetPasswordTokenRepository } from "./reset-password-token.repository";
import { TokenRepository } from "./token.repository";
import { MoreThan } from "typeorm";

/**
 * Auth repository facade for database operations
 * Injects dedicated tenant-aware repositories for strict isolation
 */
@Injectable()
export class AuthRepository {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
        private readonly tokenRepository: TokenRepository
    ) { }

    /**
     * Create OTP record
     * @param otpData - OTP data
     * @returns Created OTP
     */
    async createOtp(otpData: Partial<Otp>): Promise<Otp> {
        const otp = this.otpRepository.create(otpData);
        return this.otpRepository.save(otp);
    }

    /**
     * Find latest OTP by user ID and type
     * @param userId - User ID
     * @param otpType - OTP type
     * @returns Latest OTP
     */
    async findLatestOtpByUserIdAndType(userId: string, otpType: OtpType): Promise<Otp | null> {
        return this.otpRepository.findOne({
            where: { userId, otpType, isUsed: false },
            order: { createdAt: SortDirection.DESC }
        });
    }

    /**
     * Mark OTP as used
     * @param otpId - OTP ID
     */
    async markOtpAsUsed(otpId: string): Promise<void> {
        await this.otpRepository.update({ id: otpId }, { isUsed: true });
    }

    /**
     * Get OTP left time
     * @param userId - User ID
     * @param otpType - OTP type
     * @returns Expiry time
     */
    async getOtpExpireTime(userId: string, otpType: OtpType): Promise<Date | null> {
        const otp = await this.findLatestOtpByUserIdAndType(userId, otpType);
        return otp ? otp.expireAt : null;
    }

    /**
     * Create reset password token
     * @param tokenData - Token data
     * @returns Created token
     */
    async createResetPasswordToken(tokenData: Partial<ResetPasswordToken>): Promise<ResetPasswordToken> {
        const token = this.resetPasswordTokenRepository.create(tokenData);
        return this.resetPasswordTokenRepository.save(token);
    }

    /**
     * Find reset password token by token string
     * @param resetToken - Reset token
     * @returns Reset token record
     */
    async findResetPasswordToken(resetToken: string): Promise<ResetPasswordToken | null> {
        return this.resetPasswordTokenRepository.findOne({
            where: {
                resetToken,
                isUsed: false,
                expireAt: MoreThan(new Date())
            },
            relations: ["user"]
        });
    }

    /**
     * Mark reset token as used
     * @param tokenId - Token ID
     */
    async markResetTokenAsUsed(tokenId: string): Promise<void> {
        await this.resetPasswordTokenRepository.update({ id: tokenId }, { isUsed: true });
    }

    /**
     * Remove expired OTPs
     * @param userId - User ID
     * @param otpType - OTP type
     */
    async removeExpiredOtps(userId: string, otpType: OtpType): Promise<void> {
        await this.otpRepository.delete({
            userId,
            otpType,
            expireAt: MoreThan(new Date())
        });
    }

    /**
     * Store login token in database
     * @param accessToken - JWT access token
     * @param refreshToken - JWT refresh token
     * @param userId - User ID
     * @param rememberMe - Whether to remember the user
     */
    async storeLoginToken(
        accessToken: string,
        refreshToken: string,
        userId: string,
        rememberMe = false
    ): Promise<void> {
        const token = this.tokenRepository.create({
            accessToken,
            refreshToken,
            userId,
            rememberMe
        });
        await this.tokenRepository.save(token);
    }

    /**
     * Find token by access token
     * @param accessToken - JWT access token
     * @returns Token record
     */
    async findTokenByAccessToken(accessToken: string): Promise<Token | null> {
        return this.tokenRepository.findOne({
            where: { accessToken },
            relations: ["user"]
        });
    }

    /**
     * Find token by refresh token
     * @param refreshToken - JWT refresh token
     * @returns Token record
     */
    async findTokenByRefreshToken(refreshToken: string): Promise<Token | null> {
        return this.tokenRepository.findOne({
            where: { refreshToken },
            relations: ["user"]
        });
    }

    /**
     * Remove all tokens for a user (logout from all devices)
     * @param userId - User ID
     */
    async removeUserTokens(userId: string): Promise<void> {
        await this.tokenRepository.delete({ userId });
    }

    /**
     * Remove specific token by access token
     * @param accessToken - JWT access token
     */
    async removeTokenByAccessToken(accessToken: string): Promise<void> {
        await this.tokenRepository.delete({ accessToken });
    }
}
