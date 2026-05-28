import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateServiceCategoryRequestDto,
    ListServiceCategoryRequestDto,
    ServiceCategoryResponseDto,
    ServiceCategoryService,
    UpdateServiceCategoryRequestDto,
    UpdateServiceCategoryStatusRequestDto
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

const SERVICE_CATEGORY_MODULE_NAME = MapToModuleName(ModuleNames.SERVICE_CATEGORY);

@ApiTags("Service Categories")
@Controller("categories")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class ServiceCategoryController {
    constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus(
        "List service categories",
        [HttpStatus.OK],
        SERVICE_CATEGORY_MODULE_NAME,
        CommonSearchResponseDto,
        ServiceCategoryResponseDto
    )
    async findList(
        @Query() query: ListServiceCategoryRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<ServiceCategoryResponseDto>>> {
        return this.serviceCategoryService.findList(query);
    }

    @Get(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "id", description: "Category ID" })
    @ApiResponseStatus("Get service category", [HttpStatus.OK, HttpStatus.NOT_FOUND], SERVICE_CATEGORY_MODULE_NAME, ServiceCategoryResponseDto)
    async findById(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.findById(id);
    }

    @Post()
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiResponseStatus(
        "Create service category",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST],
        SERVICE_CATEGORY_MODULE_NAME,
        ServiceCategoryResponseDto
    )
    async create(@Body() dto: CreateServiceCategoryRequestDto): Promise<AppResponse<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.create(dto);
    }

    @Put(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Category ID" })
    @ApiResponseStatus(
        "Update service category",
        [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST],
        SERVICE_CATEGORY_MODULE_NAME,
        ServiceCategoryResponseDto
    )
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateServiceCategoryRequestDto
    ): Promise<AppResponse<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.update(id, dto);
    }

    @Patch(":id/status")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiOperation({ summary: "Update service category active status" })
    @ApiParam({ name: "id", description: "Category ID" })
    @ApiResponseStatus(
        "Update service category status",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        SERVICE_CATEGORY_MODULE_NAME,
        ServiceCategoryResponseDto
    )
    async updateStatus(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateServiceCategoryStatusRequestDto
    ): Promise<AppResponse<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.updateStatus(id, dto.isActive);
    }

    @Delete(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.SERVICE_CATEGORY, permission: PERMISSION_CONSTANTS.DELETE })
    @ApiParam({ name: "id", description: "Category ID" })
    @ApiResponseStatus("Delete service category", [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST], SERVICE_CATEGORY_MODULE_NAME)
    async delete(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<Record<string, never>>> {
        return this.serviceCategoryService.delete(id);
    }
}
