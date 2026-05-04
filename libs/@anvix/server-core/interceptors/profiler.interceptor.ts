import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { ProfilerService } from "../shared-modules/profiler/app-profiler.service";

@Injectable()
export class ProfilerInterceptor implements NestInterceptor {
    constructor(private readonly profilingService: ProfilerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        const method = request.method;

        const path = this.normalizePath(request);
        const isAppRoute = path === "/v1" || path.includes("/v1/profiler") || path.includes("/v1/profiler-ui");

        if (isAppRoute) {
            return next.handle();
        }

        const store = { cacheHits: 0, cacheMisses: 0 };
        return (this.profilingService as any).storage.run(store, () => {
            return next.handle().pipe(
                tap(() => {
                    const responseTime = Date.now() - startTime;
                    const endpoint = `${method} ${path}`;
                    setImmediate(() =>
                        this.profilingService.recordProfile(
                            endpoint,
                            method,
                            path,
                            responseTime,
                            false,
                            store.cacheHits || 0,
                            store.cacheMisses || 0
                        )
                    );
                }),
                catchError((err) => {
                    const responseTime = Date.now() - startTime;
                    const endpoint = `${method} ${path}`;
                    setImmediate(() =>
                        this.profilingService.recordProfile(
                            endpoint,
                            method,
                            path,
                            responseTime,
                            true,
                            store.cacheHits || 0,
                            store.cacheMisses || 0
                        )
                    );
                    throw err;
                })
            );
        });
    }

    private normalizePath(request: any): string {
        // Use the route path if available (e.g. "/users/:id")
        if (request.route?.path) {
            return Array.isArray(request.route.path) ? request.route.path[0] : request.route.path;
        }

        // Fallback to URL and sanitize it (remove query params and IDs)
        let path = request.url.split("?")[0];

        // Replace UUIDs
        path = path.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ":uuid");

        // Replace numeric IDs (heuristic: segments that are purely numeric)
        path = path
            .split("/")
            .map((segment) => {
                return /^\d+$/.test(segment) ? ":id" : segment;
            })
            .join("/");

        return path;
    }
}
