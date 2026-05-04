import { Injectable, Scope } from "@nestjs/common";
import { AsyncContextService } from "@core-generic-services";

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