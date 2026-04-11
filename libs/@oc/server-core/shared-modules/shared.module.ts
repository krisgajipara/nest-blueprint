import { Global, Module } from "@nestjs/common";
import { RequestContextService } from "@core-utilities";
import { AppCacheModule } from "./cache/app-cache.module";
import { AppJwtModule } from "./jwt/app-jwt.module";
import { AppMailerModule } from "./mailer/app-mailer.module";
import { AppPermissionModule } from "./permission/app-permission.module";
import { AppS3Module } from "./s3/app-s3.module";

/**
 * Global utilities module
 * Provides utility services that can be injected anywhere in the application
 */
@Global()
@Module({
    imports: [
        AppCacheModule,
        AppPermissionModule,
        AppS3Module,
        AppJwtModule,
        AppMailerModule
    ],
    providers: [RequestContextService],
    exports: [
        RequestContextService,
        AppCacheModule,
        AppPermissionModule,
        AppS3Module,
        AppJwtModule,
        AppMailerModule
    ]
})
export class SharedModule { }
