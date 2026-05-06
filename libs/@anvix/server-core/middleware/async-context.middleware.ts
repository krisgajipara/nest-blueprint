import { Injectable, NestMiddleware, Scope } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncContextService } from '../generic-service/async-context.service';

/**
 * Middleware that initializes AsyncLocalStorage context for each request.
 * This must run before any other middleware that sets context data.
 *
 * The ALS context provides thread-safe storage for request-scoped data
 * that can be accessed from anywhere in the async call chain, including
 * TypeORM subscribers.
 */
@Injectable({ scope: Scope.REQUEST })
export class AsyncContextMiddleware implements NestMiddleware {
    constructor(private readonly asyncContextService: AsyncContextService) {}

    use(req: Request, res: Response, next: NextFunction): void {
        // Initialize AsyncLocalStorage context for this request
        this.asyncContextService.initializeContext();

        // Continue with request processing
        next();
    }
}