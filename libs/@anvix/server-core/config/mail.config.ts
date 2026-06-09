import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const mailConfig = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const secure = configService.get<boolean>("email.secure");
        const port = configService.get<number>("email.port");

        return {
            transport: {
                host: configService.get("email.host"),
                port,
                secure,
                // STARTTLS should be used when not on implicit TLS port (e.g. 587).
                ignoreTLS: !!secure,
                requireTLS: !secure,
                auth: {
                    user: configService.get("email.user"),
                    pass: configService.get("email.pass")
                }
            },
            preview: configService.get("server.env") == "development",
            defaults: {
                from: `"Standard " <${configService.get("email.user")}>`
            },
            template: {
                dir: "libs/@anvix/server-core/email-templates",
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true
                }
            },
            otp_validity_minutes: configService.get("app.otp.expire_time"),
            support_email: configService.get("email.support_email"),
            academy_name: configService.get("email.academy_name"),
            academy_website: configService.get("email.academy_website")
        };
    }
};
