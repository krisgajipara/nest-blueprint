import { Injectable, Scope } from '@nestjs/common';
import { asyncLocalStorage } from '../context/context.storage';

/**
 * JWT payload interface containing user information from token
 */
export interface JwtPayload {
    sub: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    userType: number;
    roleId: string | null;
    tenantId?: string;
    role: any;
}

/**
 * Complete request context interface stored per request
 */
export interface AppRequestContext {
    language?: string;
    tenantId?: string;
    tokenPayload?: JwtPayload;
}

/**
 * Context keys for AsyncLocalStorage
 */
export const CONTEXT_KEYS = {
    USER_ID: 'userId',
    TENANT_ID: 'tenantId',
    LANGUAGE: 'language',
    TOKEN_PAYLOAD: 'tokenPayload'
} as const;

/**
 * Request-scoped service that manages request context using AsyncLocalStorage.
 * Provides both injectable methods for use within NestJS and static methods for use
 * in TypeORM subscribers and other places where DI is not available.
 *
 * IMPORTANT: This service must be REQUEST-scoped to ensure proper isolation
 * between concurrent requests.
 */
@Injectable({ scope: Scope.REQUEST })
export class AsyncContextService {
    /**
     * Initialize context store for the current async context
     * Should be called at the beginning of request processing
     */
    initializeContext(): void {
        const store = new Map<string, any>();
        asyncLocalStorage.enterWith(store);
    }

    /**
     * Clear context data
     */
    clearContext(): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store.clear();
        }
    }

    //#region User ID (legacy compatibility)
    /**
     * Set user ID for audit purposes
     * @param userId - User ID to set in context
     */
    setUserId(userId: string): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store.set(CONTEXT_KEYS.USER_ID, userId);
        }
    }

    /**
     * Get user ID from context
     * @returns User ID or undefined if not set
     */
    getUserId(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.USER_ID);
    }
    //#endregion

    //#region Language
    /**
     * Set request language
     * @param language - Language code (e.g., 'en', 'fr')
     */
    setLanguage(language: string): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store.set(CONTEXT_KEYS.LANGUAGE, language.toLowerCase());
        }
    }

    /**
     * Get request language
     * @returns Language code or undefined if not set
     */
    getLanguage(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.LANGUAGE);
    }
    //#endregion

    //#region Tenant ID
    /**
     * Set tenant ID for multi-tenant context
     * @param tenantId - Tenant ID to set in context
     */
    setTenantId(tenantId: string): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store.set(CONTEXT_KEYS.TENANT_ID, tenantId);
        }
    }

    /**
     * Get tenant ID from context
     * @returns Tenant ID or undefined if not set
     */
    getTenantId(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.TENANT_ID);
    }
    //#endregion

    //#region Token Payload
    /**
     * Set full JWT token payload
     * @param payload - decoded JWT payload
     */
    setTokenPayload(payload: JwtPayload): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store.set(CONTEXT_KEYS.TOKEN_PAYLOAD, payload);
        }
    }

    /**
     * Get full JWT token payload
     * @returns Token payload or undefined if not set
     */
    getTokenPayload(): JwtPayload | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.TOKEN_PAYLOAD);
    }
    //#endregion

    // Static methods for use in TypeORM subscribers (where DI is not available)

    /**
     * Static method to get user ID from AsyncLocalStorage
     * Safe to use in TypeORM subscribers
     */
    static getUserId(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.USER_ID);
    }

    /**
     * Static method to get tenant ID from AsyncLocalStorage
     * Safe to use in TypeORM subscribers
     */
    static getTenantId(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.TENANT_ID);
    }

    /**
     * Static method to get language from AsyncLocalStorage
     * Safe to use in TypeORM subscribers
     */
    static getLanguage(): string | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.LANGUAGE);
    }

    /**
     * Static method to get token payload from AsyncLocalStorage
     * Safe to use in TypeORM subscribers
     */
    static getTokenPayload(): JwtPayload | undefined {
        const store = asyncLocalStorage.getStore();
        return store?.get(CONTEXT_KEYS.TOKEN_PAYLOAD);
    }
}