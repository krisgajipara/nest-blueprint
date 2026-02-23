import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class AuditContextService {
    //#region Setting User ID for audit purposes
    private userId: string;

    setUserId(userId: string) {
        this.userId = userId;
        // Also set in static context for TypeORM subscriber
        AuditContext.setUserId(userId);
    }

    getUserId(): string {
        return this.userId;
    }
    //#endregion
}

// Static context for TypeORM subscriber access
export class AuditContext {
    private static userId: string;

    static setUserId(userId: string) {
        this.userId = userId;
    }

    static getUserId(): string {
        return this.userId;
    }

    static clear() {
        this.userId = undefined;
    }
}
