import {
    ServiceRepository,
    ServiceCategoryRepository,
    ServiceCategoryService
} from "@business-core-modules";
import { Service, ServiceCategory } from "@core-database";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceCategoryController } from "./service-category.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ServiceCategory, Service])],
    controllers: [ServiceCategoryController],
    providers: [ServiceCategoryRepository, ServiceCategoryService, ServiceRepository],
    exports: [ServiceCategoryRepository, ServiceCategoryService, ServiceRepository]
})
export class ServiceCategoryModule {}
