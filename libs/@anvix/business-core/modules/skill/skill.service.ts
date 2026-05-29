import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { Skill } from "@core-database";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ServiceSkillMappingRepository } from "../service-skill-mapping/service-skill-mapping.repository";
import { StylistSkillMappingRepository } from "../stylist-skill-mapping/stylist-skill-mapping.repository";
import {
    CreateSkillRequestDto,
    ListSkillRequestDto,
    SkillResponseDto,
    UpdateSkillRequestDto
} from "./dto";
import { SkillRepository } from "./skill.repository";

@Injectable()
export class SkillService {
    constructor(
        private readonly skillRepository: SkillRepository,
        private readonly stylistSkillMappingRepository: StylistSkillMappingRepository,
        private readonly serviceSkillMappingRepository: ServiceSkillMappingRepository
    ) {}

    async create(dto: CreateSkillRequestDto): Promise<AppResponse<SkillResponseDto>> {
        const existing = await this.skillRepository.findByName(dto.name);
        if (existing) {
            throw new BadRequestException({ message: "ERR_SKILL_EXISTS" });
        }

        const skill = this.skillRepository.create({
            name: dto.name,
            description: dto.description ?? null,
            isActive: dto.isActive ?? true
        });
        const saved = await this.skillRepository.save(skill);

        return new AppResponse(SuccessConstant.AddSuccessAction, new SkillResponseDto(saved), {
            module: MapToModuleName(ModuleNames.SKILL)
        });
    }

    async findList(
        searchRequest: ListSkillRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<SkillResponseDto>>> {
        const [skills, total] = await this.skillRepository.findSkills(searchRequest);
        const results = skills.map((skill) => new SkillResponseDto(skill));
        const response = new CommonSearchResponseDto(
            results,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.SKILL)
        });
    }

    async findById(id: string): Promise<AppResponse<SkillResponseDto>> {
        const skill = await this.findSkillOrThrow(id);
        return new AppResponse(SuccessConstant.DetailFetch, new SkillResponseDto(skill), {
            module: MapToModuleName(ModuleNames.SKILL)
        });
    }

    async update(id: string, dto: UpdateSkillRequestDto): Promise<AppResponse<SkillResponseDto>> {
        const skill = await this.findSkillOrThrow(id);

        if (dto.name && dto.name !== skill.name) {
            const existing = await this.skillRepository.findByName(dto.name);
            if (existing && existing.id !== id) {
                throw new BadRequestException({ message: "ERR_SKILL_EXISTS" });
            }
            skill.name = dto.name;
        }

        if (dto.description !== undefined) {
            skill.description = dto.description;
        }
        if (dto.isActive !== undefined) {
            skill.isActive = dto.isActive;
        }

        const saved = await this.skillRepository.save(skill);
        return new AppResponse(SuccessConstant.UpdateSuccessAction, new SkillResponseDto(saved), {
            module: MapToModuleName(ModuleNames.SKILL)
        });
    }

    async updateStatus(id: string, isActive: boolean): Promise<AppResponse<SkillResponseDto>> {
        return this.update(id, { isActive });
    }

    async delete(id: string): Promise<AppResponse<Record<string, never>>> {
        await this.findSkillOrThrow(id);

        const stylistCount = await this.stylistSkillMappingRepository.countBySkillId(id);
        const serviceCount = await this.serviceSkillMappingRepository.countBySkillId(id);
        if (stylistCount > 0 || serviceCount > 0) {
            throw new BadRequestException({ message: "ERR_SKILL_IN_USE" });
        }

        await this.skillRepository.softDelete(id);
        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, {
            module: MapToModuleName(ModuleNames.SKILL)
        });
    }

    async findSkillsByIds(ids: string[]): Promise<Skill[]> {
        return this.skillRepository.findByIds(ids);
    }

    private async findSkillOrThrow(id: string): Promise<Skill> {
        const skill = await this.skillRepository.findOne({ where: { id } as any });
        if (!skill) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.SKILL)
            });
        }
        return skill;
    }
}
