import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { Service, ServiceCategory } from "@core-database";
import { ModuleNames } from "@core-enums";
import { GenerateLogPrefix, MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
    CreateServiceCategoryRequestDto,
    ListServiceCategoryRequestDto,
    UpdateServiceCategoryRequestDto
} from "./dto";
import { ServiceCategoryResponseDto } from "./dto/response";
import { ServiceRepository } from "../service/service.repository";
import { ServiceCategoryRepository } from "./service-category.repository";

@Injectable()
export class ServiceCategoryService {
    private readonly logger = new Logger(ServiceCategoryService.name);

    constructor(
        private readonly serviceCategoryRepository: ServiceCategoryRepository,
        private readonly serviceRepository: ServiceRepository
    ) {}

    async create(dto: CreateServiceCategoryRequestDto): Promise<AppResponse<ServiceCategoryResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.create.name);
        this.logger.debug(`${logPrefix} : Creating service category ${dto.name}`);

        const existing = await this.serviceCategoryRepository.findByName(dto.name);
        if (existing) {
            throw new BadRequestException({ message: "ERR_SERVICE_CATEGORY_EXISTS" });
        }

        const category = this.serviceCategoryRepository.create({
            name: dto.name,
            gender: dto.gender,
            isActive: dto.isActive ?? true
        });
        const saved = await this.serviceCategoryRepository.save(category);
        const response = new ServiceCategoryResponseDto(saved);

        return new AppResponse(SuccessConstant.AddSuccessAction, response, {
            module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
        });
    }

    async findList(
        searchRequest: ListServiceCategoryRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<ServiceCategoryResponseDto>>> {
        const [categories, total] = await this.serviceCategoryRepository.findCategories(searchRequest);
        const results = categories.map((category) => new ServiceCategoryResponseDto(category));
        const response = new CommonSearchResponseDto(
            results,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
        });
    }

    async findById(id: string): Promise<AppResponse<ServiceCategoryResponseDto>> {
        const category = await this.serviceCategoryRepository.findOne({ where: { id } as any });
        if (!category) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
            });
        }

        return new AppResponse(SuccessConstant.DetailFetch, new ServiceCategoryResponseDto(category), {
            module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
        });
    }

    async update(id: string, dto: UpdateServiceCategoryRequestDto): Promise<AppResponse<ServiceCategoryResponseDto>> {
        const category = await this.serviceCategoryRepository.findOne({ where: { id } as any });
        if (!category) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
            });
        }

        if (dto.name && dto.name !== category.name) {
            const existing = await this.serviceCategoryRepository.findByName(dto.name);
            if (existing && existing.id !== id) {
                throw new BadRequestException({ message: "ERR_SERVICE_CATEGORY_EXISTS" });
            }
            category.name = dto.name;
        }

        if (dto.gender !== undefined) {
            category.gender = dto.gender;
        }

        if (dto.isActive !== undefined) {
            category.isActive = dto.isActive;
            if (!dto.isActive) {
                await this.deactivateCategoryServices(id);
            }
        }

        const updated = await this.serviceCategoryRepository.save(category);
        return new AppResponse(SuccessConstant.UpdateSuccessAction, new ServiceCategoryResponseDto(updated), {
            module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
        });
    }

    async updateStatus(id: string, isActive: boolean): Promise<AppResponse<ServiceCategoryResponseDto>> {
        return this.update(id, { isActive });
    }

    async delete(id: string): Promise<AppResponse<Record<string, never>>> {
        const category = await this.serviceCategoryRepository.findOne({ where: { id } as any });
        if (!category) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
            });
        }

        const serviceCount = await this.serviceCategoryRepository
            .createQueryBuilder("category")
            .innerJoin(Service, "service", "service.categoryId = category.id")
            .where("category.id = :id", { id })
            .andWhere("service.deletedAt IS NULL")
            .getCount();

        if (serviceCount > 0) {
            throw new BadRequestException({ message: "ERR_SERVICE_CATEGORY_HAS_SERVICES" });
        }

        await this.serviceCategoryRepository.softDelete(id);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, {
            module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
        });
    }

    async findActiveById(id: string): Promise<ServiceCategory | null> {
        return this.serviceCategoryRepository.findOne({ where: { id, isActive: true } as any });
    }

    private async deactivateCategoryServices(categoryId: string): Promise<void> {
        await this.serviceRepository.deactivateByCategoryId(categoryId);
    }
}
