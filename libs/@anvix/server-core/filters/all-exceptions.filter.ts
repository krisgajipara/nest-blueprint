import { TranslationFile } from "@core-enums";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { QueryFailedError } from "typeorm";
import { captureExceptionInSentry, handleDatabaseError, Translation } from "@core-utilities";

@Catch()
export class AllHttpExceptionFilter implements ExceptionFilter {
    readonly #logger: Logger = new Logger(AllHttpExceptionFilter.name);
    constructor(private readonly configService: ConfigService) {}

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse<Response>();

        // Sentry integration - capture exception if Sentry is enabled
        captureExceptionInSentry(exception, request, this.configService);

        let status: number;
        let getResponse: any;

        // Handle QueryFailedError (database errors)
        if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;
            getResponse = handleDatabaseError(exception);
        }
        // Handle HttpException
        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            getResponse = exception.getResponse();
        }
        // Handle other unexpected errors
        else {
            console.error("Unexpected Error in Exception Filter:", exception);
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            getResponse = { message: "ERR_INTERNAL_SERVER_ERROR" };
        }

        const lang =
            request?.body?.language_code ||
            request?.query?.language_code ||
            request?.params?.language_code ||
            request?.user?.language_code ||
            request?.headers?.language_code;

        const errors = await this.filterResponse(getResponse, lang);
        console.log("errors: ", errors);
        response.status(status).json({
            message: errors?.[0]?.displayError || "ERR_INTERNAL_SERVER_ERROR",
            developerErrors: errors
        });
    }

    async filterResponse(response: any, lang = "en") {
        try {
            let messages: string[] = [];
            let parameters: any = {};

            if (response && typeof response === "object" && response.message) {
                if (Array.isArray(response.message)) {
                    messages = response.message;
                } else {
                    messages = [response.message];
                }
                parameters = response;
            } else if (typeof response === "string") {
                messages = [response];
            } else if (Array.isArray(response)) {
                messages = response;
            }

            const result = [];

            for (const msg of messages) {
                if (!msg) continue; // avoid undefined

                const parts = msg.split("&&&");

                // case: message has system-specific formatting
                if (parts.length > 2) {
                    result.push({
                        key: parts[1],
                        errorType: "system",
                        actualError: await Translation.Translator("en", TranslationFile.Error, parts[0], parameters),
                        displayError: await Translation.Translator(lang, TranslationFile.Error, parts[2], parameters)
                    });
                }

                // default case
                else {
                    result.push({
                        key: parts[0],
                        errorType: "ui",
                        actualError: await Translation.Translator("en", TranslationFile.Error, parts[0], parameters),
                        displayError: await Translation.Translator(lang, TranslationFile.Error, parts[0], parameters)
                    });
                }
            }

            return result;
        } catch (error) {
            this.#logger.error("Error -- ", error);
        }
    }
}
