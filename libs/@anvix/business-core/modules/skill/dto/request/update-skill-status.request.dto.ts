import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateSkillStatusRequestDto {
    @ApiProperty({ description: "Active status" })
    @IsBoolean()
    isActive: boolean;
}
