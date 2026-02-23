import { SwaggerConfig } from "@core-config";
import { AllHttpExceptionFilter } from "@core-filters";
import { ReqResInterceptor } from "@core-interceptors";
import { ForbiddenException, Logger, LogLevel, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule } from "@nestjs/swagger";
import * as Sentry from "@sentry/node";
import { json } from "body-parser";
import { useContainer } from "class-validator";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: process.env.LOG_ENABLE === "true" ? (["debug", "error", "warn", "log"] as LogLevel[]) : false
    });
    // Please remove constant security if using backend as https
    app.use(helmet({ contentSecurityPolicy: true }));
    const configService = app.get<ConfigService>(ConfigService);

    const sentryEnabled = configService.get<boolean>("sentry.enabled");
    const sentryDsn = configService.get<string>("sentry.dsn");

    if (sentryEnabled && sentryDsn) {
        Sentry.init({
            dsn: sentryDsn,
            environment: configService.get<string>("sentry.environment") || configService.get<string>("server.env"),
            tracesSampleRate: configService.get<number>("sentry.traces_sample_rate"),
            profilesSampleRate: configService.get<number>("sentry.profiles_sample_rate"),
            debug: process.env.NODE_ENV === "development"
        });
    }

    // Dynamic CORS Policy
    const logger = new Logger("CORS");

    app.enableCors({
        origin: async (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) {
                return callback(null, true);
            }

            // Allowed static origins (Dev & Product Owner)
            const allowedOrigins = configService.get("server.origin") as string[];

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Block request
            logger.warn(`Blocked CORS for origin: ${origin}`);
            callback(new ForbiddenException("Not allowed by CORS"));
        },
        methods: "GET,PUT,PATCH,POST,DELETE",
        credentials: true
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(json({ limit: "15mb" }));
    app.use(compression());

    app.setGlobalPrefix("v1");
    const cookieSecret = configService.get("cookie_secret.secret");
    app.use(cookieParser(cookieSecret));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new ReqResInterceptor());

    const allHttpExceptionFilter = app.get(AllHttpExceptionFilter);
    app.useGlobalFilters(allHttpExceptionFilter);

    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup("api", app, document);

    const serverPort = configService.get("server.port");
    await app.listen(serverPort);

    console.log(`please check below for swagger \n http://localhost:${serverPort}/api`);
}
bootstrap();
