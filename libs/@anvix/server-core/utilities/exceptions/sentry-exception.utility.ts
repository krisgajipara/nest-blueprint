import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/node";

const logger = new Logger("SentryUtility");

/**
 * Captures exceptions in Sentry with rich context
 * @param exception - The exception to capture
 * @param request - The request object
 * @param configService - ConfigService instance
 */
export const captureExceptionInSentry = (exception: any, request: any, configService: ConfigService): void => {
    try {
        const sentryEnabled = configService.get<boolean>("sentry.enabled");
        const sentryDsn = configService.get<string>("sentry.dsn");

        if (!sentryEnabled || !sentryDsn) {
            logger.debug("Sentry is disabled or DSN not configured");
            return;
        }

        // Skip capturing known exceptions like 404 and 409
        if (exception instanceof HttpException && ([
            HttpStatus.NOT_FOUND,
            HttpStatus.CONFLICT,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.NO_CONTENT,
            HttpStatus.BAD_REQUEST,
            HttpStatus.FORBIDDEN
        ].includes(exception.getStatus()))) {
            logger.debug(`Skipping capture of known exception: status ${exception.getStatus()}`);
            return;
        }

        logger.log("Capturing exception in Sentry");

        if (exception instanceof Error) {
            Sentry.withScope((scope) => {
                // Set request context
                scope.setTag("http.method", request.method);
                scope.setTag("http.url", request.url);

                // Set user context if available
                if (request.user) {
                    scope.setUser({
                        id: request.user.sub?.toString(),
                        email: request.user.email,
                        username: `${request.user.firstName} ${request.user.lastName}`
                    });
                }

                // Set additional context
                scope.setExtra("headers", sanitizeHeaders(request.headers));
                scope.setExtra("params", request.params);
                scope.setExtra("query", request.query);

                // Capture the exception
                Sentry.captureException(exception);
                logger.debug("Exception captured in Sentry successfully");
            });
        } else {
            // Capture non-error exceptions as messages
            Sentry.captureMessage(`Non-error exception: ${exception}`);
            logger.debug("Non-error exception captured in Sentry");
        }
    } catch (sentryError) {
        // Don't let Sentry errors break the application
        logger.error("Failed to capture exception in Sentry:", sentryError);
    }
};

/**
 * Sanitizes headers to remove sensitive information before sending to Sentry
 * @param headers - The headers object to sanitize
 * @returns Sanitized headers object
 */
export const sanitizeHeaders = (headers: any): any => {
    if (!headers) return {};

    const sanitized = { ...headers };
    const sensitiveHeaders = ["authorization", "cookie", "set-cookie", "x-api-key"];

    sensitiveHeaders.forEach((header) => {
        if (sanitized[header]) {
            sanitized[header] = "[REDACTED]";
        }
    });

    logger.debug("Headers sanitized for Sentry");
    return sanitized;
};

/**
 * Checks if Sentry is enabled and configured
 * @param configService - ConfigService instance
 * @returns true if Sentry is enabled and DSN is configured
 */
export const isSentryEnabled = (configService: ConfigService): boolean => {
    const result =
        configService.get<boolean>("sentry.enabled") && configService.get<string>("sentry.dsn") !== undefined;
    logger.debug(`Sentry enabled check: ${result}`);
    return result;
};

/**
 * Sets Sentry user context
 * @param user - User object
 */
export const setSentryUser = (user: Sentry.User): void => {
    try {
        Sentry.setUser(user);
        logger.debug("Sentry user context set");
    } catch (error) {
        logger.error("Failed to set Sentry user:", error);
    }
};

/**
 * Sets Sentry context
 * @param name - Context name
 * @param context - Context data
 */
export const setSentryContext = (name: string, context: any): void => {
    try {
        Sentry.setContext(name, context);
        logger.debug(`Sentry context '${name}' set`);
    } catch (error) {
        logger.error("Failed to set Sentry context:", error);
    }
};

