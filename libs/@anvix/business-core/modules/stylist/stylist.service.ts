import { AppResponse, CommonDropdownResponseDto, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { ModuleNames, UserTypeEnum } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserRequestDto } from "../user/dto/request/create-user.request.dto";
import { ListUserRequestDto } from "../user/dto/request/list-user.request.dto";
import { UserDropdownRequestDto } from "../user/dto/request/user-dropdown.request.dto";
import { UserResponseDto } from "../user/dto/response/user.response.dto";
import { StylistSkillMappingService } from "../stylist-skill-mapping/stylist-skill-mapping.service";
import { UserService } from "../user/user.service";
import {
    CreateStylistRequestDto,
    ListStylistRequestDto,
    StylistDropdownRequestDto,
    StylistResponseDto,
    UpdateStylistRequestDto
} from "./dto";

/**
 * Thin facade over UserService scoped to stylists (userType STYLIST).
 */
@Injectable()
export class StylistService {
    private readonly stylistModuleName = MapToModuleName(ModuleNames.STYLIST);

    constructor(
        private readonly userService: UserService,
        private readonly stylistSkillMappingService: StylistSkillMappingService
    ) {}

    async create(dto: CreateStylistRequestDto): Promise<AppResponse<StylistResponseDto>> {
        const payload = {
            ...dto,
            userType: UserTypeEnum.STYLIST
        } as CreateUserRequestDto;

        const result = await this.userService.create(payload);
        return this.wrapSingle(result, SuccessConstant.AddSuccessAction);
    }

    async findList(
        searchRequest: ListStylistRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<StylistResponseDto>>> {
        const listRequest: ListUserRequestDto = {
            ...searchRequest,
            userType: UserTypeEnum.STYLIST
        };

        const result = await this.userService.findList(listRequest);
        const listData = result.data as CommonSearchResponseDto<UserResponseDto>;
        const stylistIds = listData.results.map((user) => user.id);
        const skillsByStylistId = await this.stylistSkillMappingService.loadSkillSummariesByStylistIds(stylistIds);
        const stylists = listData.results.map((user) => {
            const dto = new StylistResponseDto(user);
            dto.skills = skillsByStylistId.get(user.id) ?? [];
            return dto;
        });
        const response = new CommonSearchResponseDto(
            stylists,
            listData.pageSize,
            listData.page,
            listData.totalCount
        );

        return new AppResponse(SuccessConstant.ListFetch, response, { module: this.stylistModuleName });
    }

    async findDropdown(
        searchRequest: StylistDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        const dropdownRequest: UserDropdownRequestDto = {
            ...searchRequest,
            userType: UserTypeEnum.STYLIST
        };

        const result = await this.userService.findDropdown(dropdownRequest);
        return new AppResponse(SuccessConstant.ListFetch, result.data as CommonSearchResponseDto<CommonDropdownResponseDto>, {
            module: this.stylistModuleName
        });
    }

    async findById(id: string): Promise<AppResponse<StylistResponseDto>> {
        const result = await this.userService.findById(id);
        this.assertStylistUser(result.data as UserResponseDto);
        return await this.wrapSingle(result, SuccessConstant.DetailFetch);
    }

    async update(id: string, dto: UpdateStylistRequestDto): Promise<AppResponse<StylistResponseDto>> {
        await this.ensureStylistExists(id);
        const result = await this.userService.update(id, dto);
        return await this.wrapSingle(result, SuccessConstant.UpdateSuccessAction);
    }

    async remove(id: string): Promise<AppResponse<Record<string, never>>> {
        await this.ensureStylistExists(id);
        const result = await this.userService.remove(id);
        return new AppResponse(SuccessConstant.RemoveSuccessAction, result.data, { module: this.stylistModuleName });
    }

    private async ensureStylistExists(id: string): Promise<void> {
        const result = await this.userService.findById(id);
        this.assertStylistUser(result.data as UserResponseDto);
    }

    private assertStylistUser(user: UserResponseDto): void {
        if (user.userType !== UserTypeEnum.STYLIST) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: this.stylistModuleName
            });
        }
    }

    private async wrapSingle(
        result: AppResponse<UserResponseDto>,
        successConstant: string
    ): Promise<AppResponse<StylistResponseDto>> {
        const user = result.data as UserResponseDto;
        const dto = new StylistResponseDto(user);
        const skillsMap = await this.stylistSkillMappingService.loadSkillSummariesByStylistIds([user.id]);
        dto.skills = skillsMap.get(user.id) ?? [];

        return new AppResponse(successConstant, dto, {
            module: this.stylistModuleName
        });
    }
}
