import { AppResponse } from "@business-core-dto";
import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { InternalServerErrorResponseDto } from "libs/@oc/business-core/dto/common-dto/error/internal-server-error.response.dto";
import { UnauthorizedResponseDto } from "libs/@oc/business-core/dto/common-dto/error/unauthorized.response.dto";

export function ApiResponseStatus(
    description: string,
    statuses: HttpStatus[],
    module: string,
    responseDto?: any,
    genericType?: any
) {
    const decorators: any[] = [
        ApiOperation({ summary: description }),
        ApiExtraModels(InternalServerErrorResponseDto, UnauthorizedResponseDto)
    ];

    if (responseDto) {
        decorators.push(ApiExtraModels(responseDto));

        if (genericType) {
            decorators.push(ApiExtraModels(genericType));
        }
    }

    const commonErrorStatuses = [HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.SERVICE_UNAVAILABLE];

    if (!statuses || statuses.length === 0) {
        statuses = [
            HttpStatus.OK,
            HttpStatus.CREATED,
            HttpStatus.NO_CONTENT,
            HttpStatus.BAD_REQUEST,
            HttpStatus.UNAUTHORIZED,
            HttpStatus.FORBIDDEN,
            HttpStatus.NOT_FOUND,
            HttpStatus.CONFLICT,
            HttpStatus.UNPROCESSABLE_ENTITY,
            ...commonErrorStatuses
        ];
    } else {
        commonErrorStatuses.forEach((err) => {
            if (!statuses.includes(err)) statuses.push(err);
        });
    }

    // ----------------------
    // Centralized handlers
    // ----------------------
    const responseHandlers: Record<number, () => void> = {
        [HttpStatus.OK]: () => {
            if (!responseDto) {
                return decorators.push(
                    ApiResponse({
                        status: HttpStatus.OK,
                        type: AppResponse,
                        description: `Successfully retrieved ${module} data`
                    })
                );
            }

            // With DTO + generic results[]
            let dataSchema: any = {
                $ref: getSchemaPath(responseDto)
            };

            if (genericType) {
                dataSchema = {
                    type: "object",
                    allOf: [
                        { $ref: getSchemaPath(responseDto) },
                        {
                            properties: {
                                results: {
                                    type: "array",
                                    items: { $ref: getSchemaPath(genericType) }
                                }
                            }
                        }
                    ]
                };
            }

            decorators.push(
                ApiResponse({
                    status: HttpStatus.OK,
                    schema: {
                        allOf: [{ $ref: getSchemaPath(AppResponse) }, { properties: { data: dataSchema } }]
                    },
                    description: `Successfully retrieved ${module} data`
                })
            );
        },

        [HttpStatus.CREATED]: () => {
            if (!responseDto) {
                return decorators.push(
                    ApiResponse({
                        status: HttpStatus.CREATED,
                        type: AppResponse,
                        description: `Successfully created ${module}`
                    })
                );
            }

            decorators.push(
                ApiResponse({
                    status: HttpStatus.CREATED,
                    schema: {
                        allOf: [
                            { $ref: getSchemaPath(AppResponse) },
                            {
                                properties: {
                                    data: { $ref: getSchemaPath(responseDto) }
                                }
                            }
                        ]
                    },
                    description: `Successfully created ${module}`
                })
            );
        },

        [HttpStatus.NO_CONTENT]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.NO_CONTENT,
                    description: `${module} data not found`
                })
            ),

        [HttpStatus.BAD_REQUEST]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.BAD_REQUEST,
                    description: "Malformed request or invalid parameters"
                })
            ),

        [HttpStatus.UNAUTHORIZED]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.UNAUTHORIZED,
                    type: UnauthorizedResponseDto,
                    description: "Invalid or missing authentication credentials"
                })
            ),

        [HttpStatus.FORBIDDEN]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.FORBIDDEN,
                    description: "Permission denied"
                })
            ),

        [HttpStatus.NOT_FOUND]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.NOT_FOUND,
                    description: `The requested ${module} was not found`
                })
            ),

        [HttpStatus.CONFLICT]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.CONFLICT,
                    description: `A ${module} with the same identifier already exists`
                })
            ),

        [HttpStatus.UNPROCESSABLE_ENTITY]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    description: "Validation or semantic processing failed"
                })
            ),

        [HttpStatus.GATEWAY_TIMEOUT]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.GATEWAY_TIMEOUT,
                    description: "Upstream server timeout"
                })
            ),

        [HttpStatus.INTERNAL_SERVER_ERROR]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    type: InternalServerErrorResponseDto,
                    description: "Unexpected server error"
                })
            ),

        [HttpStatus.SERVICE_UNAVAILABLE]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.SERVICE_UNAVAILABLE,
                    description: "Service temporarily unavailable"
                })
            ),

        [HttpStatus.NOT_ACCEPTABLE]: () =>
            decorators.push(
                ApiResponse({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    description: "Content not acceptable based on Accept headers"
                })
            )
    };

    // Apply handlers
    statuses.forEach((status) => {
        const handler = responseHandlers[status];
        if (handler) handler();
        else console.warn(`Unsupported status code: ${status}`);
    });

    return applyDecorators(...decorators);
}
