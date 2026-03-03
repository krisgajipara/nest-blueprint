import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
    private tenantId: string;

    setTenantId(tenantId: string): void {
        this.tenantId = tenantId;
        // Also set in static context for TypeORM subscriber
        TenantContext.setTenantId(tenantId);
    }

    getTenantId(): string {
        return this.tenantId;
    }
}

// Static context for TypeORM subscriber access
export class TenantContext {
    private static tenantId: string;

    static setTenantId(tenantId: string) {
        this.tenantId = tenantId;
    }

    static getTenantId(): string {
        return this.tenantId;
    }

    static clear() {
        this.tenantId = undefined;
    }
}
