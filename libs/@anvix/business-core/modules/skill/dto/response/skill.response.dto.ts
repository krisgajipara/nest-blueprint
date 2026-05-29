import { Skill } from "@core-database";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SkillResponseDto {
    @ApiProperty({ description: "Skill ID" })
    id: string;

    @ApiProperty({ description: "Skill name" })
    name: string;

    @ApiPropertyOptional({ description: "Description" })
    description?: string | null;

    @ApiProperty({ description: "Active status" })
    isActive: boolean;

    @ApiPropertyOptional({ description: "Created at" })
    createdAt?: Date;

    @ApiPropertyOptional({ description: "Updated at" })
    updatedAt?: Date;

    constructor(skill: Skill) {
        this.id = skill.id;
        this.name = skill.name;
        this.description = skill.description;
        this.isActive = skill.isActive;
        this.createdAt = skill.createdAt;
        this.updatedAt = skill.updatedAt;
    }
}
