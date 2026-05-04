import { Injectable, Scope } from "@nestjs/common";
import { AsyncContextService } from "./async-context.service";

/**
 * @deprecated Use AsyncContextService instead. This service is kept for backward compatibility
 * but delegates to AsyncContextService which uses AsyncLocalStorage for thread-safe context management.
 */
@Injectable({ scope: Scope.REQUEST })
export class AuditContextService {
    constructor(private readonly asyncContextService: AsyncContextService) {}

    //#region Setting User ID for audit purposes
    setUserId(userId: string) {
        this.asyncContextService.setUserId(userId);
    }

    getUserId(): string | undefined {
        return this.asyncContextService.getUserId();
    }
    //#endregion
}
