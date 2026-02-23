import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppS3Service } from "./app-s3.service";

/**
 * S3 Module
 * Provides AWS S3 operations across the application
 */
@Module({
    imports: [ConfigModule],
    providers: [AppS3Service],
    exports: [AppS3Service]
})
export class AppS3Module { }
