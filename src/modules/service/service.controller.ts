import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateServiceRequestDto,
    ListServiceRequestDto,
    ServiceResponseDto,
    ServiceService,
    UpdateServiceRequestDto,
    UpdateServiceStatusRequestDto
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, RequirePermissions } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { imageFileFilter, MapToModuleName } from "@core-utilities";
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
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const SERVICE_MODULE_NAME = MapToModuleName(ModuleNames.SERVICE);

@ApiTags("Services")
@Controller("services")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus(
        "List services",
        [HttpStatus.OK],
        SERVICE_MODULE_NAME,
        CommonSearchResponseDto,
        ServiceResponseDto
    )
    async findList(
        @Query() query: ListServiceRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<ServiceResponseDto>>> {
        return this.serviceService.findList(query);
    }

    @Get(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "id", description: "Service ID" })
    @ApiResponseStatus("Get service", [HttpStatus.OK, HttpStatus.NOT_FOUND], SERVICE_MODULE_NAME, ServiceResponseDto)
    async findById(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<ServiceResponseDto>> {
        return this.serviceService.findById(id);
    }

    @Post()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("image", { fileFilter: imageFileFilter }))
    @ApiResponseStatus(
        "Create service",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST],
        SERVICE_MODULE_NAME,
        ServiceResponseDto
    )
    async create(@Body() dto: CreateServiceRequestDto, @UploadedFile() image?: any) {
        return this.serviceService.create(dto, image);
    }

    @Put(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("image", { fileFilter: imageFileFilter }))
    @ApiParam({ name: "id", description: "Service ID" })
    @ApiResponseStatus(
        "Update service",
        [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST],
        SERVICE_MODULE_NAME,
        ServiceResponseDto
    )
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateServiceRequestDto,
        @UploadedFile() image?: any
    ) {
        return this.serviceService.update(id, dto, image);
    }

    @Patch(":id/status")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({ summary: "Update service active status" })
    @ApiParam({ name: "id", description: "Service ID" })
    @ApiResponseStatus(
        "Update service status",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_MODULE_NAME,
        ServiceResponseDto
    )
    async updateStatus(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateServiceStatusRequestDto
    ): Promise<AppResponse<ServiceResponseDto>> {
        return this.serviceService.updateStatus(id, dto.isActive);
    }

    @Delete(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE, permission: PERMISSION_CONSTANTS.DELETE })
    @ApiParam({ name: "id", description: "Service ID" })
    @ApiResponseStatus("Delete service", [HttpStatus.OK, HttpStatus.NOT_FOUND], SERVICE_MODULE_NAME)
    async delete(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<Record<string, never>>> {
        return this.serviceService.delete(id);
    }
}
