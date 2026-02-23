import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AppJwtService } from "./app-jwt.service";

/**
 * JWT Module
 * Provides JWT token generation and verification across the application
 */
@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            global: true,
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("jwt.secret"),
                signOptions: { expiresIn: configService.get<string>("jwt.expire_in") as any }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [AppJwtService],
    exports: [AppJwtService]
})
export class AppJwtModule { }
