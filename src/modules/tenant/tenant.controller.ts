import { AppResponse, CommonDropdownRequestDto, CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateTenantRequestDto,
    ListTenantRequestDto,
    TenantDropdownResponseDto,
    TenantPublicResponseDto,
    TenantResponseDto,
    TenantService,
    UpdateTenantRequestDto
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, RequirePermissions, TenantApi } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { imageFileFilter, MapToModuleName } from "@core-utilities";
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

const TENANT_MODULE_NAME = MapToModuleName(ModuleNames.TENANT);

@ApiTags("Tenants")
@TenantApi()
@Controller("tenants")
export class TenantController {
    constructor(
        private readonly tenantService: TenantService
    ) {}

    /**
     * Resolve tenant information by subdomain for initial frontend load
     */
    @Get("by-subdomain")
    @ApiOperation({
        summary: "Resolve tenant by subdomain",
        description:
            "This endpoint is public and used by frontend to get tenant config (branding, colors) before login. Subdomain is extracted from the origin/host header."
    })
    @ApiResponseStatus(
        "Resolve tenant by subdomain",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        TENANT_MODULE_NAME,
        TenantPublicResponseDto
    )
    async getBySubdomain(@Req() req: Request): Promise<AppResponse<TenantPublicResponseDto>> {
        const originOrHost = (req.headers.origin as string) || (req.headers.host as string);
        const subdomain = this.tenantService.extractSubdomain(originOrHost);

        return this.tenantService.getTenantBySubdomain(subdomain);
    }

    @Get()
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.READ })
    @ApiOperation({
        summary: "List all tenants",
        description: "Admin only: List all tenants with pagination and filtering."
    })
    @ApiResponseStatus(
        "List all tenants",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST],
        TENANT_MODULE_NAME,
        CommonSearchResponseDto,
        TenantResponseDto
    )
    async findAll(
        @Query() query: ListTenantRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<TenantResponseDto>>> {
        return this.tenantService.findList(query);
    }

    @Get("dropdown")
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.READ })
    @ApiOperation({
        summary: "List active tenants for dropdown",
        description:
            "Admin only: List active tenants with id and name for dropdown/auto-complete with search and pagination."
    })
    @ApiResponseStatus(
        "List active tenants for dropdown",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST],
        TENANT_MODULE_NAME,
        CommonSearchResponseDto,
        TenantDropdownResponseDto
    )
    async findDropdown(
        @Query() query: CommonDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<TenantDropdownResponseDto>>> {
        return this.tenantService.findDropdown(query);
    }

    @Get(":id")
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "id", description: "Tenant ID" })
    @ApiOperation({ summary: "Get tenant by ID", description: "Admin only: Get full tenant details." })
    @ApiResponseStatus(
        "Get tenant by ID",
        [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST],
        TENANT_MODULE_NAME,
        TenantResponseDto
    )
    async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<TenantResponseDto>> {
        return this.tenantService.findById(id);
    }

    @Post()
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiOperation({ summary: "Create a new tenant", description: "Admin only: Create a new tenant configuration." })
    @ApiResponseStatus(
        "Create a new tenant",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
        TENANT_MODULE_NAME,
        TenantResponseDto
    )
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("logo", { fileFilter: imageFileFilter }))
    async create(
        @Body() createTenantDto: CreateTenantRequestDto,
        @UploadedFile() logo: any
    ): Promise<AppResponse<TenantResponseDto>> {
        return this.tenantService.create(createTenantDto, logo);
    }

    @Put(":id")
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Tenant ID" })
    @ApiOperation({
        summary: "Update tenant details",
        description: "Admin only: Update an existing tenant configuration."
    })
    @ApiResponseStatus(
        "Update tenant details",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        TENANT_MODULE_NAME,
        TenantResponseDto
    )
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("logo", { fileFilter: imageFileFilter }))
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateTenantDto: UpdateTenantRequestDto,
        @UploadedFile() logo: any
    ): Promise<AppResponse<TenantResponseDto>> {
        return this.tenantService.update(id, updateTenantDto, logo);
    }

    @Put(":id/deactivate")
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Tenant ID" })
    @ApiOperation({
        summary: "Deactivate a tenant",
        description: "Admin only: Deactivate an existing tenant by setting its status to INACTIVE."
    })
    @ApiResponseStatus(
        "Deactivate tenant",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        TENANT_MODULE_NAME,
        TenantResponseDto
    )
    async deactivate(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<TenantResponseDto>> {
        return this.tenantService.deactivate(id);
    }

    @Put(":id/activate")
    @UseGuards(RoleGuard)
    @ApiBearerAuth()
    @RequirePermissions({ module: MODULE_CONSTANTS.TENANT, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Tenant ID" })
    @ApiOperation({
        summary: "Activate a tenant",
        description: "Admin only: Activate an existing tenant by setting its status to ACTIVE."
    })
    @ApiResponseStatus(
        "Activate tenant",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        TENANT_MODULE_NAME,
        TenantResponseDto
    )
    async activate(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<TenantResponseDto>> {
        return this.tenantService.activate(id);
    }
}
