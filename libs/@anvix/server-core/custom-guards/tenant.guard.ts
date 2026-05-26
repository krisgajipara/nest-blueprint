import { ALLOW_WITHOUT_TENANT_KEY } from "@core-custom-decorators";
import { AsyncContextService } from "@core-generic-services";
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    Scope
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

/**
 * Global guard: requires a valid tenant header and validated tenant context
 * unless the route/controller is marked with @AllowWithoutTenant() or @TenantApi().
 *
 * TenantContextMiddleware must run before this guard (it validates and sets tenantId).
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly asyncContextService: AsyncContextService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const allowWithoutTenant = this.reflector.getAllAndOverride<boolean>(ALLOW_WITHOUT_TENANT_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (allowWithoutTenant) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request & { tenantId?: string }>();
        const headerTenantId = this.extractTenantIdFromRequest(request);

        if (!headerTenantId) {
            throw new BadRequestException(
                "Tenant context is required. Provide x-tenant or x-tenant-id header."
            );
        }

        const contextTenantId = this.asyncContextService.getTenantId();
        if (!contextTenantId) {
            throw new BadRequestException("Invalid or inactive tenant.");
        }

        if (contextTenantId !== headerTenantId) {
            throw new BadRequestException("Tenant header does not match validated tenant context.");
        }

        return true;
    }

    private extractTenantIdFromRequest(request: Request): string | undefined {
        const raw =
            (request.headers["x-tenant"] as string) || (request.headers["x-tenant-id"] as string);
        const trimmed = raw?.trim();
        return trimmed || undefined;
    }
}
