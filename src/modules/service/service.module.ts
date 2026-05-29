import {
    ServiceRepository,
    ServiceService,
    ServiceStaffMappingRepository,
    ServiceStaffMappingService
} from "@business-core-modules";
import { Service, ServiceStaffMapping } from "@core-database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SkillModule } from "../skill/skill.module";
import { ServiceCategoryModule } from "../service-category/service-category.module";
import { UserModule } from "../user/user.module";
import { ServiceController } from "./service.controller";
import { ServiceSkillController } from "./service-skill.controller";
import { ServiceStaffController } from "./service-staff.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Service, ServiceStaffMapping]),
        ServiceCategoryModule,
        UserModule,
        SkillModule
    ],
    controllers: [ServiceController, ServiceStaffController, ServiceSkillController],
    providers: [ServiceRepository, ServiceService, ServiceStaffMappingRepository, ServiceStaffMappingService],
    exports: [ServiceService, ServiceStaffMappingService]
})
export class ServiceModule {}
