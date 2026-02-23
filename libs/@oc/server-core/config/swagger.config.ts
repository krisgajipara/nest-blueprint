import { DocumentBuilder } from "@nestjs/swagger";

export const SwaggerConfig = new DocumentBuilder()
    .setTitle("Oneclick Node Boilerplate 3.0 API Documentation")
    .addBearerAuth()
    .addCookieAuth("auth")
    .setExternalDoc("Nest API Spec", "/api-json")
    .setDescription("Node Boilerplate 3.0 API documentation.")
    .setVersion("1.0")
    .addGlobalParameters(
        { name: "language", description: "Enter language code(ex. en)", in: "header" },
    )
    .build();
