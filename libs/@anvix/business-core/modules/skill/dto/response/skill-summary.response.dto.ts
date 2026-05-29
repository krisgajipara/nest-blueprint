import { Skill } from "@core-database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** Compact skill reference for nested list/detail responses. */
export class SkillSummaryDto {
    @ApiProperty({ description: "Skill ID" })
    id: string;

    @ApiProperty({ description: "Skill name", example: "Hair Coloring" })
    name: string;

    @ApiPropertyOptional({ description: "Active status" })
    isActive?: boolean;

    constructor(skill: Skill | { id: string; name: string; isActive?: boolean }) {
        this.id = skill.id;
        this.name = skill.name;
        this.isActive = skill.isActive;
    }
}
