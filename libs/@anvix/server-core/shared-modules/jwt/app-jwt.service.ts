import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User as UserEntity } from "../../database/entities/user.entity";

/**
 * JWT utility service for token generation and management
 */
@Injectable()
export class AppJwtService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    /**
     * Generate JWT access and refresh tokens with user payload
     * @param user - User object containing authentication data
     * @param rememberMe - Optional boolean to extend token validity
     * @returns Object containing accessToken and refreshToken
     */
    async generateJWTToken(
        user: UserEntity,
        rememberMe?: boolean
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = {
            sub: user.id,
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType, 
            roleId: user.roleId
        };

        const accessTokenExpiresIn = rememberMe
            ? parseInt(this.configService.get<string>("jwt.expire_in_remember_me"))
            : parseInt(this.configService.get<string>("jwt.expire_in"));

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("jwt.secret"),
            expiresIn: accessTokenExpiresIn
        });

        const refreshPayload = {
            sub: user.id
        };

        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.get<string>("refresh_token.secret"),
            expiresIn: this.configService.get<string>("refresh_token.expire_in") as any
        });

        return {
            accessToken,
            refreshToken
        };
    }

    /**
     * Generate only refresh token for token refresh operations
     * @param user - User object for token payload
     * @returns Signed refresh token string
     */
    generateRefreshToken(user: UserEntity): string {
        const refreshPayload = {
            sub: user.id,
            email: user.email
        };

        return this.jwtService.sign(refreshPayload, {
            secret: this.configService.get<string>("refresh_token.secret"),
            expiresIn: this.configService.get<string>("refresh_token.expire_in") as any
        });
    }

    /**
     * Verify JWT token
     * @param token - JWT token to verify
     * @returns Decoded token payload
     */
    verifyToken(token: string): any {
        return this.jwtService.verify(token);
    }

    /**
     * Decode JWT token without verification
     * @param token - JWT token to decode
     * @returns Decoded token payload
     */
    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }
}
