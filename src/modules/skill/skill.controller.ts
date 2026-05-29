import { CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateSkillRequestDto,
    ListSkillRequestDto,
    SkillResponseDto,
    SkillService,
    UpdateSkillRequestDto,
    UpdateSkillStatusRequestDto
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, RequirePermissions } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const SKILL_MODULE_NAME = MapToModuleName(ModuleNames.SKILL);

@ApiTags("Skills")
@Controller("skills")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class SkillController {
    constructor(private readonly skillService: SkillService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus("List skills", [HttpStatus.OK], SKILL_MODULE_NAME, CommonSearchResponseDto, SkillResponseDto)
    async findList(@Query() query: ListSkillRequestDto) {
        return this.skillService.findList(query);
    }

    @Get(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "id", description: "Skill ID" })
    @ApiResponseStatus("Get skill", [HttpStatus.OK, HttpStatus.NOT_FOUND], SKILL_MODULE_NAME, SkillResponseDto)
    async findById(@Param("id", ParseUUIDPipe) id: string) {
        return this.skillService.findById(id);
    }

    @Post()
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiResponseStatus("Create skill", [HttpStatus.CREATED, HttpStatus.BAD_REQUEST], SKILL_MODULE_NAME, SkillResponseDto)
    async create(@Body() dto: CreateSkillRequestDto) {
        return this.skillService.create(dto);
    }

    @Put(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Skill ID" })
    @ApiResponseStatus("Update skill", [HttpStatus.OK, HttpStatus.NOT_FOUND], SKILL_MODULE_NAME, SkillResponseDto)
    async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSkillRequestDto) {
        return this.skillService.update(id, dto);
    }

    @Patch(":id/status")
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({ summary: "Update skill active status" })
    @ApiParam({ name: "id", description: "Skill ID" })
    @ApiResponseStatus("Update skill status", [HttpStatus.OK, HttpStatus.NOT_FOUND], SKILL_MODULE_NAME, SkillResponseDto)
    async updateStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSkillStatusRequestDto) {
        return this.skillService.updateStatus(id, dto.isActive);
    }

    @Delete(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SKILL, permission: PERMISSION_CONSTANTS.DELETE })
    @ApiParam({ name: "id", description: "Skill ID" })
    @ApiResponseStatus("Delete skill", [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST], SKILL_MODULE_NAME)
    async delete(@Param("id", ParseUUIDPipe) id: string) {
        return this.skillService.delete(id);
    }
}
