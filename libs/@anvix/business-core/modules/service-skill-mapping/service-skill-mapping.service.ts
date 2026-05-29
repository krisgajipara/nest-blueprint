import { AppResponse } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ServiceRepository } from "../service/service.repository";
import { SkillSummaryDto } from "../skill/dto/response/skill-summary.response.dto";
import { SkillRepository } from "../skill/skill.repository";
import { AssignServiceSkillsRequestDto, ServiceSkillMappingResponseDto } from "./dto";
import { ServiceSkillMappingRepository } from "./service-skill-mapping.repository";

@Injectable()
export class ServiceSkillMappingService {
    constructor(
        private readonly mappingRepository: ServiceSkillMappingRepository,
        private readonly skillRepository: SkillRepository,
        private readonly serviceRepository: ServiceRepository
    ) {}

    async assignSkills(
        serviceId: string,
        dto: AssignServiceSkillsRequestDto
    ): Promise<AppResponse<ServiceSkillMappingResponseDto[]>> {
        await this.ensureServiceExists(serviceId);

        const skillIds = dto.skillIds ?? [];
        const uniqueSkillIds = new Set(skillIds);
        if (uniqueSkillIds.size !== skillIds.length) {
            throw new BadRequestException({ message: "ERR_UNIQUE_ARRAY_ITEM", field: "skillIds" });
        }

        if (skillIds.length) {
            const skills = await this.skillRepository.findByIds(skillIds);
            if (skills.length !== skillIds.length) {
                throw new NotFoundException({
                    message: "ERR_MODULE_NOT_FOUND",
                    module: MapToModuleName(ModuleNames.SKILL)
                });
            }
        }

        const existingMappings = await this.mappingRepository.find({ where: { serviceId } as any });
        const existingBySkillId = new Map(existingMappings.map((mapping) => [mapping.skillId, mapping]));
        const requestedSkillIds = new Set(skillIds);

        for (const skillId of skillIds) {
            if (!existingBySkillId.has(skillId)) {
                const created = this.mappingRepository.create({ serviceId, skillId });
                await this.mappingRepository.save(created);
            }
        }

        for (const mapping of existingMappings) {
            if (!requestedSkillIds.has(mapping.skillId)) {
                await this.mappingRepository.softDelete(mapping.id);
            }
        }

        const results = await this.mappingRepository.findByServiceId(serviceId);
        return new AppResponse(
            SuccessConstant.UpdateSuccessAction,
            results.map((mapping) => new ServiceSkillMappingResponseDto(mapping)),
            { module: MapToModuleName(ModuleNames.SERVICE)
            }
        );
    }

    async listByService(serviceId: string): Promise<AppResponse<ServiceSkillMappingResponseDto[]>> {
        await this.ensureServiceExists(serviceId);
        const mappings = await this.mappingRepository.findByServiceId(serviceId);
        return new AppResponse(
            SuccessConstant.ListFetch,
            mappings.map((mapping) => new ServiceSkillMappingResponseDto(mapping)),
            { module: MapToModuleName(ModuleNames.SERVICE) }
        );
    }

    async loadSkillSummariesByServiceIds(serviceIds: string[]): Promise<Map<string, SkillSummaryDto[]>> {
        const mappings = await this.mappingRepository.findByServiceIds(serviceIds);
        const map = new Map<string, SkillSummaryDto[]>();

        for (const mapping of mappings) {
            if (!mapping.skill) {
                continue;
            }
            const summary = new SkillSummaryDto(mapping.skill);
            const existing = map.get(mapping.serviceId) ?? [];
            existing.push(summary);
            map.set(mapping.serviceId, existing);
        }

        return map;
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
}
