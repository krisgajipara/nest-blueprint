import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppMailerService } from "./app-mailer.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { mailConfig } from "@core-config";

/**
 * Mailer Module
 * Provides email sending functionality across the application
 */
@Module({
    imports: [ConfigModule, MailerModule.forRootAsync(mailConfig)],
    providers: [AppMailerService],
    exports: [AppMailerService]
})
export class AppMailerModule { }
