import { Injectable, NestMiddleware, Scope } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AsyncContextService } from "../generic-service/async-context.service";

@Injectable({ scope: Scope.REQUEST })
export class LanguageMiddleware implements NestMiddleware {
    constructor(private readonly asyncContextService: AsyncContextService) {}

    use(req: Request, res: Response, next: NextFunction) {
        // Extract language from Accept-Language header or x-language header
        const acceptLanguage = req.headers["accept-language"] as string;
        const xLanguage = req.headers["x-language"] as string;
        
        // Prefer x-language header if present, otherwise use Accept-Language
        const language = xLanguage || (acceptLanguage ? acceptLanguage.split(",")[0].trim() : "en");
        
        // Set language in context
        this.asyncContextService.setLanguage(language);
        
        next();
    }
}
