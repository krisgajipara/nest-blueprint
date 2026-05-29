import { AppResponse } from "@business-core-dto";
import {
    AssignServiceSkillsRequestDto,
    ServiceSkillMappingResponseDto,
    ServiceSkillMappingService
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, RequirePermissions } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const SERVICE_MODULE_NAME = MapToModuleName(ModuleNames.SERVICE);

@ApiTags("Service Skills")
@Controller("services/:serviceId/skills")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class ServiceSkillController {
    constructor(private readonly serviceSkillMappingService: ServiceSkillMappingService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiResponseStatus(
        "List skills linked to service",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceSkillMappingResponseDto
    )
    async list(@Param("serviceId", ParseUUIDPipe) serviceId: string) {
        return this.serviceSkillMappingService.listByService(serviceId);
    }

    @Put()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({
        summary: "Link skills to service",
        description:
            "Replaces skills on the service. Used by admins when choosing stylists; does not auto-filter staff assignment."
    })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiResponseStatus(
        "Assign skills to service",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceSkillMappingResponseDto
    )
    async assign(
        @Param("serviceId", ParseUUIDPipe) serviceId: string,
        @Body() dto: AssignServiceSkillsRequestDto
    ): Promise<AppResponse<ServiceSkillMappingResponseDto[]>> {
        return this.serviceSkillMappingService.assignSkills(serviceId, dto);
    }
}
