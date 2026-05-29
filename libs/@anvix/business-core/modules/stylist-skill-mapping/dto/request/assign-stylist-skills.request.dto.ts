import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class AssignStylistSkillsRequestDto {
    @ApiProperty({
        description: "Full list of skill IDs for this stylist (replaces existing; empty clears all)",
        type: [String],
        example: ["123e4567-e89b-12d3-a456-426614174000"]
    })
    @IsArray()
    @IsUUID("4", { each: true })
    skillIds: string[];
}
