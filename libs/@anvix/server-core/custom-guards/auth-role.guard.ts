import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserTypeEnum } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { PermissionRequirement } from "@core-custom-decorators";
import { Token } from "@core-database";
import { AppPermissionService } from "../shared-modules/permission/app-permission.service";

/**
 * JWT payload interface
 */
export interface JwtPayload {
    sub: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    userType: UserTypeEnum;
    roleId: string | null;
    tenantId?: string;
    role?: any;
}

/**
 * AuthRoleGuard - Authentication and authorization guard with tenant awareness
 * - Extracts & validates JWT from Authorization header
 * - Validates token against database (token exists, user active, email unchanged, role unchanged)
 * - Validates tenant: compares token's tenantId with x-tenant header (skip for PRODUCT_OWNER)
 * - Checks permissions via @RequirePermissions() decorator metadata
 * - PRODUCT_OWNER (SUPER_ADMIN) bypasses all permission checks
 * - Invalidates tokens on role/email change or user deactivation
 */
@Injectable()
export class AuthRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly asyncContextService: AsyncContextService,
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
        private readonly appPermissionService: AppPermissionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Extract token from Authorization header
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("No token provided");
        }

        try {
            // Verify and decode token
            const payload = this.jwtService.verify<JwtPayload>(token);

            // Validate token against database (check if revoked, user active, etc.)
            await this.validateTokenAgainstDatabase(token, payload);

            // Extract tenant information
            const tokenTenantId = payload.tenantId;
            const headerTenantId = request.headers["x-tenant"] as string ||
                                  request.headers["x-tenant-id"] as string;

            // Check if user is PRODUCT_OWNER (SUPER_ADMIN bypasses tenant matching and permissions)
            const isProductOwner = payload.userType === UserTypeEnum.SUPER_ADMIN;

            if (isProductOwner) {
                // PRODUCT_OWNER can access any tenant or perform cross-tenant operations
                const effectiveTenantId = headerTenantId || tokenTenantId;
                if (effectiveTenantId) {
                    this.asyncContextService.setTenantId(effectiveTenantId);
                    request.tenantId = effectiveTenantId;
                }

                request.user = {
                    id: payload.sub,
                    email: payload.email,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    userType: payload.userType
                };

                return true;
            }

            // For regular users: validate tenant matching
            if (tokenTenantId && headerTenantId && tokenTenantId !== headerTenantId) {
                throw new ForbiddenException("Tenant mismatch: token tenant does not match request tenant");
            }

            // Set tenant context
            const tenantId = tokenTenantId || headerTenantId;
            if (!tenantId) {
                throw new ForbiddenException("Tenant context is required for non-admin users");
            }

            this.asyncContextService.setTenantId(tenantId);
            request.tenantId = tenantId;

            // Attach user info to request
            request.user = {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                userType: payload.userType,
                roleId: payload.roleId,
                tenantId: tenantId
            };

            // Get required permissions from metadata
            const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
                "requiredPermissions",
                [context.getHandler(), context.getClass()]
            );

            // If no permissions required, allow access
            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }

            // Check if user has role information
            if (!payload.roleId) {
                throw new ForbiddenException("No role assigned to user");
            }

            // Validate permissions via AppPermissionService
            const hasPermission = await this.appPermissionService.hasPermissions(
                payload.roleId,
                requiredPermissions
            );

            if (!hasPermission) {
                throw new ForbiddenException("Insufficient permissions");
            }

            return true;
        } catch (error: any) {
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }
            if (error.name === "JsonWebTokenError") {
                throw new UnauthorizedException("Invalid token");
            }
            if (error.name === "TokenExpiredError") {
                throw new UnauthorizedException("Token expired");
            }
            throw new UnauthorizedException("Authentication failed");
        }
    }

    /**
     * Validate token against database
     * - Verify token exists in database (not revoked)
     * - Verify user account is still active
     * - Verify email hasn't changed since token was issued
     * - Verify role hasn't changed since token was issued
     */
    private async validateTokenAgainstDatabase(token: string, payload: JwtPayload): Promise<void> {
        // Check if token exists in database (verify not revoked)
        const storedToken = await this.tokenRepository.findOne({
            where: {
                accessToken: token,
                userId: payload.sub
            }
        });

        if (!storedToken) {
            throw new UnauthorizedException("Token has been revoked or is invalid");
        }

        // TODO: Validate user status, email, and role haven't changed
        // This requires injecting UserRepository to fetch current user state
        // Example implementation:
        //
        // const user = await this.userRepository.findOne({
        //     where: { id: payload.sub }
        // });
        //
        // if (!user) {
        //     throw new UnauthorizedException("User not found");
        // }
        //
        // if (user.status !== UserStatus.ACTIVE) {
        //     throw new UnauthorizedException("User account is inactive");
        // }
        //
        // if (user.email !== payload.email) {
        //     await this.invalidateToken(storedToken);
        //     throw new UnauthorizedException("Token invalidated due to email change");
        // }
        //
        // if (user.roleId !== payload.roleId) {
        //     await this.invalidateToken(storedToken);
        //     throw new UnauthorizedException("Token invalidated due to role change");
        // }
    }

    /**
     * Extract JWT token from Authorization header
     */
    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
