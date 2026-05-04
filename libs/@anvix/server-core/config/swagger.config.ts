import { DocumentBuilder } from "@nestjs/swagger";

export const SwaggerConfig = new DocumentBuilder()
    .setTitle("Oneclick Node Boilerplate 3.0 API Documentation")
    .addBearerAuth()
    .addCookieAuth("auth")
    .setExternalDoc("Backend API Profiler", "/v1/profiler-ui")
    .setDescription("Node Boilerplate 3.0 API documentation.")
    .setVersion("1.0")
    .addGlobalParameters(
        { name: "language", description: "Enter language code(ex. en)", in: "header" },
        { name: "x-tenant-id", description: "Enter Tenant ID (UUID)", in: "header" }
    )
    .build();
