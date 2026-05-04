import { Global, Module } from "@nestjs/common";
import { RequestContextService } from "./app-context.service";

/**
 * Global Context Module
 * Provides request-scoped context services for tenant management
 */
@Global()
@Module({
    providers: [RequestContextService],
    exports: [RequestContextService]
})
export class AppContextModule {}