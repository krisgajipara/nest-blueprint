import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { Service } from "@core-database";
import { ModuleNames } from "@core-enums";
import { AppS3Service } from "@core-shared-modules";
import { GenerateLogPrefix, MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { ServiceCategoryRepository } from "../service-category/service-category.repository";
import { ServiceSkillMappingService } from "../service-skill-mapping/service-skill-mapping.service";
import { ServiceStaffMappingRepository } from "../service-staff-mapping/service-staff-mapping.repository";
import { SkillSummaryDto } from "../skill/dto/response/skill-summary.response.dto";
import {
    AssignedStaffSummaryDto,
    CreateServiceRequestDto,
    ListServiceRequestDto,
    ServiceResponseDto,
    UpdateServiceRequestDto
} from "./dto";
import { ServiceRepository } from "./service.repository";

@Injectable()
export class ServiceService {
    private readonly logger = new Logger(ServiceService.name);

    constructor(
        private readonly serviceRepository: ServiceRepository,
        private readonly serviceCategoryRepository: ServiceCategoryRepository,
        private readonly serviceStaffMappingRepository: ServiceStaffMappingRepository,
        private readonly serviceSkillMappingService: ServiceSkillMappingService,
        private readonly configService: ConfigService,
        private readonly s3Utility: AppS3Service
    ) {}

    async create(dto: CreateServiceRequestDto, imageFile?: any): Promise<AppResponse<ServiceResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.create.name);
        this.logger.debug(`${logPrefix} : Creating service ${dto.name}`);

        await this.validateCategory(dto.categoryId);
        await this.ensureUniqueName(dto.categoryId, dto.name);

        let imageFileName: string | undefined;
        if (imageFile) {
            imageFileName = await this.uploadImage(imageFile);
        }

        const service = this.serviceRepository.create({
            categoryId: dto.categoryId,
            name: dto.name,
            description: dto.description ?? null,
            price: dto.price,
            durationMin: dto.durationMin,
            image: imageFileName ?? null,
            isActive: dto.isActive ?? true
        });

        const saved = await this.serviceRepository.save(service);
        const withCategory = await this.findServiceWithCategory(saved.id);

        return new AppResponse(SuccessConstant.AddSuccessAction, this.toResponse(withCategory!), {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async findList(
        searchRequest: ListServiceRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<ServiceResponseDto>>> {
        const [services, total] = await this.serviceRepository.findServices(searchRequest);
        const imageBaseUrl = this.getImageBaseUrl();
        const includeAssignedStaff = searchRequest.includeAssignedStaff !== false;
        const includeSkills = searchRequest.includeSkills !== false;
        const serviceIds = services.map((service) => service.id);
        const assignmentsByServiceId = includeAssignedStaff
            ? await this.loadAssignmentsByServiceIds(serviceIds, searchRequest.assignmentIsActive)
            : new Map<string, AssignedStaffSummaryDto[]>();
        const skillsByServiceId = includeSkills
            ? await this.serviceSkillMappingService.loadSkillSummariesByServiceIds(serviceIds)
            : new Map<string, SkillSummaryDto[]>();

        const results = services.map((service) =>
            this.toResponse(
                service,
                imageBaseUrl,
                assignmentsByServiceId.get(service.id),
                skillsByServiceId.get(service.id)
            )
        );
        const response = new CommonSearchResponseDto(
            results,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async findById(id: string): Promise<AppResponse<ServiceResponseDto>> {
        const service = await this.findServiceWithCategory(id);
        if (!service) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        const assignments = await this.loadAssignmentsByServiceIds([id]);
        const skillsMap = await this.serviceSkillMappingService.loadSkillSummariesByServiceIds([id]);
        return new AppResponse(
            SuccessConstant.DetailFetch,
            this.toResponse(service, undefined, assignments.get(id), skillsMap.get(id)),
            {
                module: MapToModuleName(ModuleNames.SERVICE)
            }
        );
    }

    async update(id: string, dto: UpdateServiceRequestDto, imageFile?: any): Promise<AppResponse<ServiceResponseDto>> {
        const service = await this.serviceRepository.findOne({ where: { id } as any });
        if (!service) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        const categoryId = dto.categoryId ?? service.categoryId;
        if (dto.categoryId) {
            await this.validateCategory(dto.categoryId);
        }

        if (dto.name && dto.name !== service.name) {
            await this.ensureUniqueName(categoryId, dto.name, id);
            service.name = dto.name;
        }

        if (dto.categoryId) {
            service.categoryId = dto.categoryId;
        }
        if (dto.description !== undefined) {
            service.description = dto.description;
        }
        if (dto.price !== undefined) {
            service.price = dto.price;
        }
        if (dto.durationMin !== undefined) {
            service.durationMin = dto.durationMin;
        }
        if (dto.isActive !== undefined) {
            service.isActive = dto.isActive;
        }

        if (imageFile) {
            if (service.image) {
                await this.removeImage(service.image);
            }
            service.image = await this.uploadImage(imageFile);
        }

        await this.serviceRepository.save(service);
        const withCategory = await this.findServiceWithCategory(id);

        return new AppResponse(SuccessConstant.UpdateSuccessAction, this.toResponse(withCategory!), {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async updateStatus(id: string, isActive: boolean): Promise<AppResponse<ServiceResponseDto>> {
        return this.update(id, { isActive });
    }

    async delete(id: string): Promise<AppResponse<Record<string, never>>> {
        const service = await this.serviceRepository.findOne({ where: { id } as any });
        if (!service) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        await this.serviceRepository.softDelete(id);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    private async validateCategory(categoryId: string): Promise<void> {
        const category = await this.serviceCategoryRepository.findOne({ where: { id: categoryId } as any });
        if (!category) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE_CATEGORY)
            });
        }
        if (!category.isActive) {
            throw new BadRequestException({ message: "ERR_SERVICE_CATEGORY_INACTIVE" });
        }
    }

    private async ensureUniqueName(categoryId: string, name: string, excludeId?: string): Promise<void> {
        const existing = await this.serviceRepository.findByCategoryAndName(categoryId, name);
        if (existing && existing.id !== excludeId) {
            throw new BadRequestException({ message: "ERR_SERVICE_EXISTS" });
        }
    }

    private async findServiceWithCategory(id: string): Promise<Service | null> {
        return this.serviceRepository.findOne({
            where: { id } as any,
            relations: ["category"]
        });
    }

    private async loadAssignmentsByServiceIds(
        serviceIds: string[],
        assignmentIsActive?: boolean
    ): Promise<Map<string, AssignedStaffSummaryDto[]>> {
        const mappings = await this.serviceStaffMappingRepository.findAssignmentsByServiceIds(
            serviceIds,
            assignmentIsActive
        );
        const map = new Map<string, AssignedStaffSummaryDto[]>();

        for (const mapping of mappings) {
            const summary = new AssignedStaffSummaryDto(mapping);
            const existing = map.get(mapping.serviceId) ?? [];
            existing.push(summary);
            map.set(mapping.serviceId, existing);
        }

        return map;
    }

    private toResponse(
        service: Service,
        imageBaseUrl?: string,
        assignedStaff?: AssignedStaffSummaryDto[],
        skills?: SkillSummaryDto[]
    ): ServiceResponseDto {
        return new ServiceResponseDto(
            service,
            imageBaseUrl ?? this.getImageBaseUrl(),
            assignedStaff,
            skills
        );
    }

    private getImageBaseUrl(): string {
        return this.configService.get<string>("cloudfront.url") || "";
    }

    private async uploadImage(file: any): Promise<string> {
        const fileExtension = extname(file.originalname).toLowerCase();
        const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
        if (!allowedTypes.includes(fileExtension)) {
            throw new BadRequestException({ message: "ERR_INVALID_FILE_TYPE" });
        }

        if (file.size > 2 * 1024 * 1024) {
            throw new BadRequestException({ message: "ERR_MAX_VALUE", field: "image", max: "2", unit: "MB" });
        }

        const fileNameOnly = `${uuidv4()}${fileExtension}`;
        const filePathWithFolder = `services/images/${fileNameOnly}`;
        await this.s3Utility.uploadS3(file.buffer, this.s3Utility.privateBucketName, filePathWithFolder, file.mimetype);
        return fileNameOnly;
    }

    private async removeImage(fileName: string): Promise<void> {
        if (!fileName) {
            return;
        }
        const filePathWithFolder = `services/images/${fileName}`;
        await this.s3Utility.deleteFileFromS3(filePathWithFolder, this.s3Utility.privateBucketName);
    }
}
