import { AppResponse } from "@business-core-dto";
import {
    AssignServiceStaffRequestDto,
    ListServiceStaffMappingRequestDto,
    QualifiedStaffResponseDto,
    ServiceStaffMappingResponseDto,
    ServiceStaffMappingService,
    UpdateServiceStaffMappingRequestDto
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
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const SERVICE_MODULE_NAME = MapToModuleName(ModuleNames.SERVICE);

@ApiTags("Service Staff Mapping")
@Controller("services/:serviceId/staff")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class ServiceStaffController {
    constructor(private readonly serviceStaffMappingService: ServiceStaffMappingService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiResponseStatus(
        "List staff assigned to a service",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceStaffMappingResponseDto
    )
    async list(
        @Param("serviceId", ParseUUIDPipe) serviceId: string,
        @Query() query: ListServiceStaffMappingRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto[]>> {
        return this.serviceStaffMappingService.listByService(serviceId, query);
    }

    @Get("qualified")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.READ })
    @ApiOperation({
        summary: "List staff qualified for a service",
        description: "Returns active staff with active assignments. Use for booking staff picker."
    })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiResponseStatus(
        "List qualified staff for booking",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        QualifiedStaffResponseDto
    )
    async listQualified(
        @Param("serviceId", ParseUUIDPipe) serviceId: string
    ): Promise<AppResponse<QualifiedStaffResponseDto[]>> {
        return this.serviceStaffMappingService.listQualifiedStaff(serviceId);
    }

    @Put()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({
        summary: "Assign staff to service",
        description: "Replaces the full staff assignment list for the service."
    })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiResponseStatus(
        "Assign staff to service",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceStaffMappingResponseDto
    )
    async assign(
        @Param("serviceId", ParseUUIDPipe) serviceId: string,
        @Body() dto: AssignServiceStaffRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto[]>> {
        return this.serviceStaffMappingService.assignStaff(serviceId, dto);
    }

    @Patch(":staffId")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiParam({ name: "staffId", description: "Staff user ID" })
    @ApiResponseStatus(
        "Update staff assignment",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceStaffMappingResponseDto
    )
    async update(
        @Param("serviceId", ParseUUIDPipe) serviceId: string,
        @Param("staffId", ParseUUIDPipe) staffId: string,
        @Body() dto: UpdateServiceStaffMappingRequestDto
    ): Promise<AppResponse<ServiceStaffMappingResponseDto>> {
        return this.serviceStaffMappingService.updateMapping(serviceId, staffId, dto);
    }

    @Delete(":staffId")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.DELETE })
    @ApiParam({ name: "serviceId", description: "Service ID" })
    @ApiParam({ name: "staffId", description: "Staff user ID" })
    @ApiResponseStatus("Remove staff assignment", [HttpStatus.OK, HttpStatus.NOT_FOUND], SERVICE_MODULE_NAME)
    async remove(
        @Param("serviceId", ParseUUIDPipe) serviceId: string,
        @Param("staffId", ParseUUIDPipe) staffId: string
    ): Promise<AppResponse<Record<string, never>>> {
        return this.serviceStaffMappingService.removeMapping(serviceId, staffId);
    }
}
