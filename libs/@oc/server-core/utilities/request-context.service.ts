import { Injectable, Inject, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    getTenantId(): string {
        return (this.request as any).tenantId || "";
    }
}
