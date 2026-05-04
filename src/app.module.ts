import { typeOrmConfig } from "@core-config";
import { CustomValidatorModule } from "@core-custom-validators";
import { AllHttpExceptionFilter } from "@core-filters";
import { AsyncContextService, AuditContextService } from "@core-generic-services";
import {
    AsyncContextMiddleware,
    AuditMiddleware,
    LanguageMiddleware,
    SwaggerAuthMiddleware,
    TenantContextMiddleware
} from "@core-middleware";
import { Validator } from "class-validator";

import { AppCacheModule, AppPermissionModule, SharedModule } from "@core-shared-modules";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configuration } from "config/configuration";
import { validationSchema } from "config/validation";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProfilerModule } from "./modules/profiler/profiling.module";
import { RoleModule } from "./modules/role/role.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { UserModule } from "./modules/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
            load: [configuration],
            validationSchema,
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRoot([
            {
                name: "short",
                ttl: 1,
                limit: 60
            }
        ]),
        ScheduleModule.forRoot(),
        CustomValidatorModule,
        ProfilerModule,
        AppCacheModule,
        AppPermissionModule,
        SharedModule,
        TenantModule, // Global module providing RequestContextService - must be loaded first
        AuthModule,
        UserModule,
        RoleModule
    ],
    controllers: [AppController],
    providers: [
        AsyncContextService,
        AuditContextService,
        Validator,
        SwaggerAuthMiddleware,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
        AllHttpExceptionFilter
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AsyncContextMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            })
            .apply(LanguageMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            })
            .apply(AuditMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            })
            .apply(TenantContextMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            });
    }
}
