import { ApiProperty } from "@nestjs/swagger";

/**
 * Response DTO for age group dropdown data
 * Contains only id and name for auto-complete and lazy loading
 */
export class CommonDropdownResponseDto {
    /**
     * Constructor to map entity to dropdown response DTO
     * @param data - Entity data with id and name
     */
    constructor(data: { id: string; name: string }) {
        this.id = data.id;
        this.name = data.name;
    }

    @ApiProperty({
        description: "Entity's unique identifier",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "Entity record name",
        example: "Kids"
    })
    name: string;
}
