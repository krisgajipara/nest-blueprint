import { Injectable, Scope } from '@nestjs/common';
import { asyncLocalStorage } from '../context/context.storage';

/**
 * Context keys for AsyncLocalStorage
 */
export const CONTEXT_KEYS = {
  USER_ID: 'userId',
  TENANT_ID: 'tenantId',
} as const;

/**
 * Request-scoped service that manages audit and tenant context using AsyncLocalStorage.
 * Provides both injectable methods for use within NestJS and static methods for use
 * in TypeORM subscribers and other places where DI is not available.
 *
 * IMPORTANT: This service must be REQUEST-scoped to ensure proper isolation
 * between concurrent requests.
 */
@Injectable({ scope: Scope.REQUEST })
export class AsyncContextService {
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
}