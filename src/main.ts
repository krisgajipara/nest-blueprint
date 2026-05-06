import { TenantService } from "@business-core-modules";
import { SwaggerConfig } from "@core-config";
import { AllHttpExceptionFilter } from "@core-filters";
import { ProfilerInterceptor, ReqResInterceptor } from "@core-interceptors";
import { SwaggerAuthMiddleware } from "@core-middleware";
import { ProfilerService } from "@core-shared-modules";
import { ForbiddenException, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule } from "@nestjs/swagger";
import * as Sentry from "@sentry/node";
import { json } from "body-parser";
import { useContainer, Validator } from "class-validator";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { preloadSecrets } from "libs/@anvix/server-core/utilities/app-aws-secrets.utility";
import { AppModule } from "./app.module";
import { TenantModule } from "./modules/tenant/tenant.module";

async function bootstrap() {
    // Load AWS secrets if platform type is Production
    if (process.env.ENVIRONMENT === "production") {
        await preloadSecrets();
    }
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: process.env.LOG_ENABLE == "true" ? ["debug", "error", "warn", "log"] : ["error", "warn"]
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
    const tenantService = await app.select(TenantModule).resolve(TenantService);
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

            // Dynamic Subdomain Validation
            try {
                const subdomain = tenantService.extractSubdomain(origin);

                if (subdomain) {
                    // Check if tenant exists for this subdomain
                    // We use a try-catch because getTenantBySubdomain throws if not found
                    try {
                        await tenantService.getTenantBySubdomain(subdomain);
                        return callback(null, true);
                    } catch (e) {
                        logger.warn(`Blocked CORS for unknown subdomain: ${subdomain} (Origin: ${origin}), ${e}`);
                    }
                }
            } catch (error) {
                logger.error(`CORS validation error: ${error}`);
            }

            // Block request
            logger.warn(`Blocked CORS for origin: ${origin}`);
            callback(new ForbiddenException("Not allowed by CORS"));
        },
        methods: "GET,PUT,PATCH,POST,DELETE",
        credentials: true
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    try {
        const validator = app.get(Validator);
        console.log("Validator resolved successfully:", !!validator);
    } catch (e) {
        console.log("Validator not resolved:", (e as Error).message);
    }
    app.use(json({ limit: "15mb" }));
    app.use(compression());

    app.setGlobalPrefix("v1");
    const cookieSecret = configService.get("cookie_secret.secret");
    app.use(cookieParser(cookieSecret));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Get ProfilingService instance and register profiling interceptor
    const profilingService = app.get(ProfilerService);
    app.useGlobalInterceptors(new ReqResInterceptor(), new ProfilerInterceptor(profilingService));

    const allHttpExceptionFilter = app.get(AllHttpExceptionFilter);
    app.useGlobalFilters(allHttpExceptionFilter);

    const swaggerAuthMiddleware = app.get(SwaggerAuthMiddleware);
    app.use("/api", (req, res, next) => swaggerAuthMiddleware.use(req, res, next));
    app.use("/api-json", (req, res, next) => swaggerAuthMiddleware.use(req, res, next));

    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup("api", app, document);

    const serverPort = configService.get("server.port");
    await app.listen(serverPort);

    console.log(`please check below for swagger \n http://localhost:${serverPort}/api`);
}
bootstrap();
