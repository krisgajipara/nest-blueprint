import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class AssignServiceSkillsRequestDto {
    @ApiProperty({
        description: "Full list of skill IDs for this service (replaces existing; empty clears all)",
        type: [String]
    })
    @IsArray()
    @IsUUID("4", { each: true })
    skillIds: string[];
}
