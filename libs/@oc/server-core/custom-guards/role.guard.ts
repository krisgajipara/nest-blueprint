import { UserTypeEnum } from "@core-enums";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PermissionRequirement } from "../custom-decorators/require-permissions.decorator";
import { AppPermissionService } from "../shared-modules/permission/app-permission.service";

/**
 * RoleGuard that checks JWT token and validates permissions from role data in token
 * Extracts role information from JWT payload and checks against required permissions
 */
@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly appPermissionService: AppPermissionService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Extract token from Authorization header
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("No token provided");
        }

        try {
            // Verify and decode token
            const payload = this.jwtService.verify(token);

            // Attach user info to request
            request.user = {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                status: payload.status,
                userType: payload.userType,
                roleId: payload.roleId
            };

            // Check if user is Product Owner or has role data
            if (payload.userType === UserTypeEnum.USER) {
                // Attach user info to request for Product Owner
                request.user = {
                    id: payload.sub,
                    email: payload.email,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    userType: payload.userType
                };
                return true;
            }

            // Check if user has role data
            if (!payload.roleId) {
                throw new ForbiddenException("No role information in token");
            }

            // Get required permissions from metadata
            const requiredPermissions = this.reflector.get<PermissionRequirement[]>(
                "requiredPermissions",
                context.getHandler()
            );

            // If no permissions required, allow access
            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }

            // Check if user has required permissions using service
            const hasPermission = await this.appPermissionService.hasPermissions(payload.role, requiredPermissions);

            if (!hasPermission) {
                throw new ForbiddenException("Insufficient permissions");
            }

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException("Invalid token");
        }
    }

    /**
     * Extract JWT token from Authorization header
     */
    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
