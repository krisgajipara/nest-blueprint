import { CacheKeyConstant, CacheModulePrefix } from "@core-constants";
import { Tenant } from "@core-database";
import { AsyncContextService } from "@core-generic-services";
import { AppCacheService } from "@core-shared-modules";
import { BadRequestException, Injectable, NestMiddleware, Scope } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";

/**
 * Middleware to extract and validate tenant context from request headers
 * Applied globally to all routes
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextMiddleware implements NestMiddleware {
    constructor(
        private readonly asyncContextService: AsyncContextService,
        private readonly dataSource: DataSource,
        private readonly appCacheService: AppCacheService
    ) {}

    async use(req: Request & { tenantId?: string }, res: Response, next: NextFunction): Promise<void> {
        // Extract tenant ID from headers
        const tenantId = (req.headers["x-tenant"] as string) || (req.headers["x-tenant-id"] as string);

        // If no tenant header, just continue (tenant is optional for public routes)
        if (!tenantId) {
            return next();
        }

        try {
            // Check cache first
            const cacheKey = `${CacheModulePrefix.Tenant}${tenantId}`;
            const cached = await this.appCacheService.get<boolean>(cacheKey);

            if (cached === true) {
                // Valid tenant from cache
                this.setTenantContext(req, tenantId);
                return next();
            }

            if (cached === false) {
                // Invalid tenant from cache
                throw new BadRequestException("Invalid Tenant ID");
            }

            // Validate tenant against database (lightweight count query)
            const tenantRepo = this.dataSource.getRepository(Tenant);
            const count = await tenantRepo.count({
                where: { id: tenantId, deletedAt: null }
            });

            if (count > 0) {
                // Cache valid result for 1 hour
                await this.appCacheService.set(cacheKey, true, CacheKeyConstant.TenantValidationValidTTL);
                this.setTenantContext(req, tenantId);
                return next();
            }

            // Cache invalid result for 1 minute (DoS prevention)
            await this.appCacheService.set(cacheKey, false, CacheKeyConstant.TenantValidationInvalidTTL);
            throw new BadRequestException("Invalid Tenant ID");
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            // For other errors, allow request to continue without tenant
            return next();
        }
    }

    /**
     * Set tenant context in both request object and AsyncLocalStorage
     */
    private setTenantContext(req: Request & { tenantId?: string }, tenantId: string): void {
        req.tenantId = tenantId;
        this.asyncContextService.setTenantId(tenantId);
    }
}
