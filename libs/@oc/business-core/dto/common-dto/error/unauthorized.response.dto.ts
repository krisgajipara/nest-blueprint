import { ApiProperty } from "@nestjs/swagger";

/**
 * Developer error detail for unauthorized responses
 */
class DeveloperError {
    @ApiProperty({
        example: "Access token not found",
        description: "Error key"
    })
    key: string;

    @ApiProperty({
        example: "ui",
        description: "Error type"
    })
    errorType: string;

    @ApiProperty({
        example: "Access token not found",
        description: "Actual error message"
    })
    actualError: string;

    @ApiProperty({
        example: "Access token not found",
        description: "User-friendly display error"
    })
    displayError: string;
}

/**
 * Unauthorized Response DTO
 * Used for 401 Unauthorized responses
 */
export class UnauthorizedResponseDto {
    /**
     * Error message describing the unauthorized access
     */
    @ApiProperty({
        example: "Access token not found",
        description: "Error message"
    })
    message: string;

    /**
     * Detailed developer errors for debugging
     */
    @ApiProperty({
        type: [DeveloperError],
        description: "Array of developer error details"
    })
    developerErrors: DeveloperError[];
}
