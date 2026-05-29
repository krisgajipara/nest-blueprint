import { StylistService } from "@business-core-modules";
import { Module } from "@nestjs/common";
import { SkillModule } from "../skill/skill.module";
import { UserModule } from "../user/user.module";
import { StylistController } from "./stylist.controller";
import { StylistSkillController } from "./stylist-skill.controller";

@Module({
    imports: [UserModule, SkillModule],
    controllers: [StylistController, StylistSkillController],
    providers: [StylistService],
    exports: [StylistService]
})
export class StylistModule {}