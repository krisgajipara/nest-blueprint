import { StylistSkillMapping } from "@core-database";
import { ApiProperty } from "@nestjs/swagger";

export class StylistSkillMappingResponseDto {
    @ApiProperty({ description: "Mapping ID" })
    id: string;

    @ApiProperty({ description: "Stylist user ID" })
    stylistId: string;

    @ApiProperty({ description: "Skill ID" })
    skillId: string;

    @ApiProperty({ description: "Skill name" })
    skillName: string;

    constructor(mapping: StylistSkillMapping) {
        this.id = mapping.id;
        this.stylistId = mapping.stylistId;
        this.skillId = mapping.skillId;
        this.skillName = mapping.skill?.name ?? "";
    }
}
