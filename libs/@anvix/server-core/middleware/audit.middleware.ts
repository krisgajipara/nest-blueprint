import { Injectable, NestMiddleware, Scope } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { AsyncContextService, JwtPayload } from "../generic-service/async-context.service";

@Injectable({ scope: Scope.REQUEST })
export class AuditMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly asyncContextService: AsyncContextService
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        const token = this.extractTokenFromHeader(req);

        if (token) {
            try {
                // Verify and decode token
                const payload = this.jwtService.verify<JwtPayload>(token);

                // Set full token payload in AsyncLocalStorage context
                if (payload) {
                    this.asyncContextService.setTokenPayload(payload);
                    
                    // Set user ID for backward compatibility (audit subscriber uses getUserId())
                    if (payload.sub) {
                        this.asyncContextService.setUserId(payload.sub);
                    }
                }
            } catch (error) {
                // If token verification fails, we don't set context but don't block the request
                // Authentication guards will handle unauthorized access
            }
        }

        next();
    }

    /**
     * Extract JWT token from Authorization header
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
