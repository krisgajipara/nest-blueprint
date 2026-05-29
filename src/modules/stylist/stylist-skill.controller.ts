import { AppResponse } from "@business-core-dto";
import {
    AssignStylistSkillsRequestDto,
    StylistSkillMappingResponseDto,
    StylistSkillMappingService
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, RequirePermissions } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const STYLIST_MODULE_NAME = MapToModuleName(ModuleNames.STYLIST);

@ApiTags("Stylist Skills")
@Controller("stylists/:stylistId/skills")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class StylistSkillController {
    constructor(private readonly stylistSkillMappingService: StylistSkillMappingService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "stylistId", description: "Stylist user ID" })
    @ApiResponseStatus(
        "List skills assigned to stylist",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        STYLIST_MODULE_NAME,
        StylistSkillMappingResponseDto
    )
    async list(@Param("stylistId", ParseUUIDPipe) stylistId: string) {
        return this.stylistSkillMappingService.listByStylist(stylistId);
    }

    @Put()
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({
        summary: "Assign skills to stylist",
        description:
            "Replaces the full skill list for the stylist. Informational for admins only; does not restrict service-staff assignment."
    })
    @ApiParam({ name: "stylistId", description: "Stylist user ID" })
    @ApiResponseStatus(
        "Assign skills to stylist",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        STYLIST_MODULE_NAME,
        StylistSkillMappingResponseDto
    )
    async assign(
        @Param("stylistId", ParseUUIDPipe) stylistId: string,
        @Body() dto: AssignStylistSkillsRequestDto
    ): Promise<AppResponse<StylistSkillMappingResponseDto[]>> {
        return this.stylistSkillMappingService.assignSkills(stylistId, dto);
    }
}
