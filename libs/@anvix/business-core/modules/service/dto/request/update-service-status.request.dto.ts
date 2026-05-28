import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateServiceStatusRequestDto {
    @ApiProperty({ description: "Active status", example: true })
    @IsBoolean()
    isActive: boolean;
}
