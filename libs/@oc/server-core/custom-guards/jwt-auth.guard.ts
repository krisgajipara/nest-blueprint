import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * JwtAuthGuard (Single-Tenant, No roles)
 * Extracts user information from JWT payload and attaches it to the request
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService
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
