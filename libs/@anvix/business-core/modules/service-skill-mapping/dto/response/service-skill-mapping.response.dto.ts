import { ServiceSkillMapping } from "@core-database";
import { ApiProperty } from "@nestjs/swagger";

export class ServiceSkillMappingResponseDto {
    @ApiProperty({ description: "Mapping ID" })
    id: string;

    @ApiProperty({ description: "Service ID" })
    serviceId: string;

    @ApiProperty({ description: "Skill ID" })
    skillId: string;

    @ApiProperty({ description: "Skill name" })
    skillName: string;

    constructor(mapping: ServiceSkillMapping) {
        this.id = mapping.id;
        this.serviceId = mapping.serviceId;
        this.skillId = mapping.skillId;
        this.skillName = mapping.skill?.name ?? "";
    }
}
