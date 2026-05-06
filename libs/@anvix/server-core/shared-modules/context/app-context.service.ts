import { Injectable, Scope } from "@nestjs/common";
import { AsyncContextService } from "@core-generic-services";

/**
 * Backward-compatible wrapper for RequestContextService.
 * Previously provided tenant context separately; now delegates to AsyncContextService.
 *
 * @deprecated Use AsyncContextService directly. This wrapper exists for backward compatibility.
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
    constructor(private readonly asyncContextService: AsyncContextService) {}

    setTenantId(id: string): void {
        this.asyncContextService.setTenantId(id);
    }

    getTenantId(): string | null {
        return this.asyncContextService.getTenantId() || null;
    }
}