import { Global, Module } from "@nestjs/common";
import { AppCacheModule } from "./cache/app-cache.module";
import { AppJwtModule } from "./jwt/app-jwt.module";
import { AppMailerModule } from "./mailer/app-mailer.module";
import { AppPermissionModule } from "./permission/app-permission.module";
import { AppProfilerModule } from "./profiler/app-profiler.module";
import { AppS3Module } from "./s3/app-s3.module";

/**
 * Global utilities module
 * Provides utility services that can be injected anywhere in the application
 */
@Global()
@Module({
    imports: [
        AppProfilerModule,
        AppCacheModule,
        AppPermissionModule,
        AppProfilerModule,
        AppS3Module,
        AppJwtModule,
        AppMailerModule
    ],
    providers: [],
    exports: [
        AppProfilerModule,
        AppCacheModule,
        AppPermissionModule,
        AppProfilerModule,
        AppS3Module,
        AppJwtModule,
        AppMailerModule
    ]
})
export class SharedModule {}
