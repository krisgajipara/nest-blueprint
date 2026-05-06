import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AsyncContextService, JwtPayload } from "@core-generic-services";

/**
 * JwtAuthGuard (Single-Tenant, No roles)
 * Extracts user information from JWT payload and attaches it to the request
 * Also stores token payload in context for downstream use
 */
@Injectable({ scope: Scope.REQUEST })
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly asyncContextService: AsyncContextService
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
            const payload = this.jwtService.verify<JwtPayload>(token);

            // Store full token payload in context
            this.asyncContextService.setTokenPayload(payload);
            
            // Set user ID for audit (backward compatibility)
            if (payload.sub) {
                this.asyncContextService.setUserId(payload.sub);
            }

            // Attach user info to request
            request.user = {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                status: payload.status,
                roleId: payload.roleId,
                userType: payload.userType
            };

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
