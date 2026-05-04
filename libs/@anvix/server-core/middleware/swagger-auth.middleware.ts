import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            this.sendUnauthorized(res);
            return;
        }

        const [type, credentials] = authHeader.split(" ");

        if (type !== "Basic" || !credentials) {
            this.sendUnauthorized(res);
            return;
        }

        const decodedCredentials = Buffer.from(credentials, "base64").toString("utf-8");
        const [user, password] = decodedCredentials.split(":");

        const swaggerUser = this.configService.get<string>("swagger.user");
        const swaggerPassword = this.configService.get<string>("swagger.password");

        if (user === swaggerUser && password === swaggerPassword) {
            next();
        } else {
            this.sendUnauthorized(res);
        }
    }

    private sendUnauthorized(res: Response) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Swagger UI"');
        res.status(401).send("Unauthorized");
    }
}
