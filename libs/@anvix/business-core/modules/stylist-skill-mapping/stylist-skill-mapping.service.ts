import { AppResponse } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { ModuleNames, UserTypeEnum } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SkillSummaryDto } from "../skill/dto/response/skill-summary.response.dto";
import { SkillRepository } from "../skill/skill.repository";
import { UserRepository } from "../user/user.repository";
import { AssignStylistSkillsRequestDto, StylistSkillMappingResponseDto } from "./dto";
import { StylistSkillMappingRepository } from "./stylist-skill-mapping.repository";

@Injectable()
export class StylistSkillMappingService {
    constructor(
        private readonly mappingRepository: StylistSkillMappingRepository,
        private readonly skillRepository: SkillRepository,
        private readonly userRepository: UserRepository
    ) {}

    async assignSkills(
        stylistId: string,
        dto: AssignStylistSkillsRequestDto
    ): Promise<AppResponse<StylistSkillMappingResponseDto[]>> {
        await this.ensureStylist(stylistId);

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

        const existingMappings = await this.mappingRepository.find({ where: { stylistId } as any });
        const existingBySkillId = new Map(existingMappings.map((mapping) => [mapping.skillId, mapping]));
        const requestedSkillIds = new Set(skillIds);

        for (const skillId of skillIds) {
            if (!existingBySkillId.has(skillId)) {
                const created = this.mappingRepository.create({ stylistId, skillId });
                await this.mappingRepository.save(created);
            }
        }

        for (const mapping of existingMappings) {
            if (!requestedSkillIds.has(mapping.skillId)) {
                await this.mappingRepository.softDelete(mapping.id);
            }
        }

        const results = await this.mappingRepository.findByStylistId(stylistId);
        return new AppResponse(
            SuccessConstant.UpdateSuccessAction,
            results.map((mapping) => new StylistSkillMappingResponseDto(mapping)),
            { module: MapToModuleName(ModuleNames.STYLIST) }
        );
    }

    async listByStylist(stylistId: string): Promise<AppResponse<StylistSkillMappingResponseDto[]>> {
        await this.ensureStylist(stylistId);
        const mappings = await this.mappingRepository.findByStylistId(stylistId);
        return new AppResponse(
            SuccessConstant.ListFetch,
            mappings.map((mapping) => new StylistSkillMappingResponseDto(mapping)),
            { module: MapToModuleName(ModuleNames.STYLIST) }
        );
    }

    async loadSkillSummariesByStylistIds(stylistIds: string[]): Promise<Map<string, SkillSummaryDto[]>> {
        const mappings = await this.mappingRepository.findByStylistIds(stylistIds);
        const map = new Map<string, SkillSummaryDto[]>();

        for (const mapping of mappings) {
            if (!mapping.skill) {
                continue;
            }
            const summary = new SkillSummaryDto(mapping.skill);
            const existing = map.get(mapping.stylistId) ?? [];
            existing.push(summary);
            map.set(mapping.stylistId, existing);
        }

        return map;
    }

    private async ensureStylist(stylistId: string): Promise<void> {
        const user = await this.userRepository.findById(stylistId);
        if (!user || user.userType !== UserTypeEnum.STYLIST) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.STYLIST)
            });
        }
    }
}
