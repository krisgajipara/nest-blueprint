import { ApiPropertyOptional } from "@nestjs/swagger";

export class GenericCacheRequestDto {
    @ApiPropertyOptional({
        description: "Enter key value"
    })
    key: string;

    @ApiPropertyOptional({
        description: "Enter value"
    })
    value: string;
}
