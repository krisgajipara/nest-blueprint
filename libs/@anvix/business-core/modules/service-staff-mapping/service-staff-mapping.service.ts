import { AppResponse } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { User } from "@core-database";
import { ModuleNames, SystemRoleType, UserStatus, UserTypeEnum } from "@core-enums";
import { GenerateLogPrefix, MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ServiceRepository } from "../service/service.repository";
import { UserService } from "../user/user.service";
import {
    AssignServiceStaffRequestDto,
    ListServiceStaffMappingRequestDto,
    QualifiedStaffResponseDto,
    ServiceStaffMappingResponseDto,
    UpdateServiceStaffMappingRequestDto
} from "./dto";
import { ServiceStaffMappingRepository } from "./service-staff-mapping.repository";

@Injectable()
export class ServiceStaffMappingService {
    private readonly logger = new Logger(ServiceStaffMappingService.name);

    constructor(
        private readonly mappingRepository: ServiceStaffMappingRepository,
        private readonly serviceRepository: ServiceRepository,
        private readonly userService: UserService
    ) {}

    async assignStaff(
        serviceId: string,
        dto: AssignServiceStaffRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto[]>> {
        const logPrefix = GenerateLogPrefix(this.assignStaff.name);
        this.logger.debug(`${logPrefix} : Assigning staff to service ${serviceId}`);

        await this.ensureServiceExists(serviceId);

        const staffIds = dto.assignments.map((item) => item.staffId);
        const uniqueStaffIds = new Set(staffIds);
        if (uniqueStaffIds.size !== staffIds.length) {
            throw new BadRequestException({ message: "ERR_UNIQUE_ARRAY_ITEM", field: "staff" });
        }

        await this.validateStaffMembers(staffIds);

        const existingMappings = await this.mappingRepository.find({ where: { serviceId } as any });
        const existingByStaffId = new Map(existingMappings.map((mapping) => [mapping.staffId, mapping]));
        const requestedStaffIds = new Set(staffIds);

        for (const assignment of dto.assignments) {
            const existing = existingByStaffId.get(assignment.staffId);
            if (existing) {
                existing.skillLevel = assignment.skillLevel;
                existing.isActive = assignment.isActive ?? true;
                await this.mappingRepository.save(existing);
                continue;
            }

            const created = this.mappingRepository.create({
                serviceId,
                staffId: assignment.staffId,
                skillLevel: assignment.skillLevel,
                isActive: assignment.isActive ?? true
            });
            await this.mappingRepository.save(created);
        }

        for (const mapping of existingMappings) {
            if (!requestedStaffIds.has(mapping.staffId)) {
                await this.mappingRepository.softDelete(mapping.id);
            }
        }

        const results = await this.mappingRepository.findByServiceId(serviceId);
        const response = results.map((mapping) => new ServiceStaffMappingResponseDto(mapping));

        return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async listByService(
        serviceId: string,
        query: ListServiceStaffMappingRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto[]>> {
        await this.ensureServiceExists(serviceId);
        const mappings = await this.mappingRepository.findByServiceId(serviceId, query.isActive);
        const response = mappings.map((mapping) => new ServiceStaffMappingResponseDto(mapping));

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async updateMapping(
        serviceId: string,
        staffId: string,
        dto: UpdateServiceStaffMappingRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto>> {
        await this.ensureServiceExists(serviceId);
        const mapping = await this.mappingRepository.findByServiceAndStaff(serviceId, staffId);
        if (!mapping) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        if (dto.skillLevel !== undefined) {
            mapping.skillLevel = dto.skillLevel;
        }
        if (dto.isActive !== undefined) {
            mapping.isActive = dto.isActive;
        }

        const updated = await this.mappingRepository.save(mapping);
        const withStaff = await this.mappingRepository.findByServiceId(serviceId);
        const refreshed = withStaff.find((item) => item.id === updated.id) ?? updated;

        return new AppResponse(SuccessConstant.UpdateSuccessAction, new ServiceStaffMappingResponseDto(refreshed), {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    async removeMapping(serviceId: string, staffId: string): Promise<AppResponse<Record<string, never>>> {
        await this.ensureServiceExists(serviceId);
        const mapping = await this.mappingRepository.findByServiceAndStaff(serviceId, staffId);
        if (!mapping) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        await this.mappingRepository.softDelete(mapping.id);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    /**
     * Staff qualified for booking: active mapping + active staff user
     */
    async listQualifiedStaff(serviceId: string): Promise<AppResponse<QualifiedStaffResponseDto[]>> {
        const service = await this.serviceRepository.findOne({
            where: { id: serviceId, isActive: true } as any
        });
        if (!service) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }

        const mappings = await this.mappingRepository.findQualifiedStaffForService(serviceId);
        const response = mappings.map((mapping) => new QualifiedStaffResponseDto(mapping));

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.SERVICE)
        });
    }

    private async ensureServiceExists(serviceId: string): Promise<void> {
        const service = await this.serviceRepository.findOne({ where: { id: serviceId } as any });
        if (!service) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SERVICE)
            });
        }
    }

    private async validateStaffMembers(staffIds: string[]): Promise<void> {
        if (!staffIds.length) {
            return;
        }

        const users = await this.userService.findStaffUsersByIds(staffIds);

        if (users.length !== staffIds.length) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.USER)
            });
        }

        for (const user of users) {
            this.assertAssignableStaff(user);
        }
    }

    private assertAssignableStaff(user: User): void {
        if (user.status !== UserStatus.ACTIVE) {
            throw new BadRequestException({ message: "ERR_USER_NOT_STAFF" });
        }

        if (user.userType === UserTypeEnum.PRODUCT_OWNER || user.userType === UserTypeEnum.SUPER_ADMIN) {
            throw new BadRequestException({ message: "ERR_USER_NOT_STAFF" });
        }

        const systemRole = user.role?.systemRoleType;
        if (systemRole === SystemRoleType.SUPER_ADMIN || systemRole === SystemRoleType.ADMIN) {
            throw new BadRequestException({ message: "ERR_USER_NOT_STAFF" });
        }
    }
}
