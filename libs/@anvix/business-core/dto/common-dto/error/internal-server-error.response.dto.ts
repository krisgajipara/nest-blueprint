import { ApiProperty } from "@nestjs/swagger";

/**
 * Internal Server Error Response DTO
 * Used for 500 Internal Server Error responses
 */
export class InternalServerErrorResponseDto {
    /**
     * HTTP status code for internal server error
     */
    @ApiProperty({
        example: 500,
        description: "HTTP status code"
    })
    statusCode: number;

    /**
     * Error message describing the internal server error
     */
    @ApiProperty({
        example: "Internal server error",
        description: "Error message"
    })
    message: string;
}
