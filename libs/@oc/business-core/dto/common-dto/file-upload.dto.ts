import { ApiPropertyOptional } from "@nestjs/swagger";

export class FileUploadDto {
    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Add file"
    })
    file: any;
}
