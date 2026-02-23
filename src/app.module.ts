import { typeOrmConfig } from "@core-config";
import { CustomValidatorModule } from "@core-custom-validators";
import { AllHttpExceptionFilter } from "@core-filters";
import { LanguageMiddleware } from "@core-middleware";
import { AuditMiddleware } from "../libs/@oc/server-core/middleware/audit.middleware";
import { AuditContextService } from "@core-generic-services";

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
import { UserModule } from "./modules/user/user.module";
import { RoleModule } from "./modules/role/role.module";

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
        AppCacheModule,
        AppPermissionModule,
        SharedModule,
        AuthModule,
        UserModule,
        RoleModule
    ],
    controllers: [AppController],
    providers: [
        AuditContextService,
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
            .apply(LanguageMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            })
            .apply(AuditMiddleware)
            .forRoutes({
                path: "*",
                method: RequestMethod.ALL
            });
    }
}
