import {
    ServiceSkillMappingRepository,
    ServiceSkillMappingService,
    SkillRepository,
    SkillService,
    StylistSkillMappingRepository,
    StylistSkillMappingService
} from "@business-core-modules";
import { ServiceSkillMapping, Skill, StylistSkillMapping } from "@core-database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceCategoryModule } from "../service-category/service-category.module";
import { UserModule } from "../user/user.module";
import { SkillController } from "./skill.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Skill, StylistSkillMapping, ServiceSkillMapping]),
        UserModule,
        ServiceCategoryModule
    ],
    controllers: [SkillController],
    providers: [
        SkillRepository,
        SkillService,
        StylistSkillMappingRepository,
        StylistSkillMappingService,
        ServiceSkillMappingRepository,
        ServiceSkillMappingService
    ],
    exports: [
        SkillService,
        SkillRepository,
        StylistSkillMappingService,
        ServiceSkillMappingService,
        StylistSkillMappingRepository,
        ServiceSkillMappingRepository
    ]
})
export class SkillModule {}
