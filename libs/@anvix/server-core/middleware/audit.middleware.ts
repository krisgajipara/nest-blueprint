import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { AsyncContextService } from "../generic-service/async-context.service";

@Injectable()
export class AuditMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly asyncContextService: AsyncContextService
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        const token = this.extractTokenFromHeader(req);

        if (token) {
            // Verify and decode token
            const payload = this.jwtService.verify(token);

            // Set user ID in AsyncLocalStorage context
            if (payload?.sub) {
                this.asyncContextService.setUserId(payload.sub);
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
