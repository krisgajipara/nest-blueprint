import { AppResponse, CommonDropdownResponseDto, CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateStylistRequestDto,
    ListStylistRequestDto,
    StylistDropdownRequestDto,
    StylistResponseDto,
    StylistService,
    UpdateStylistRequestDto
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
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

const STYLIST_MODULE_NAME = MapToModuleName(ModuleNames.STYLIST);

@ApiTags("Stylists")
@Controller("stylists")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class StylistController {
    constructor(private readonly stylistService: StylistService) {}

    @Get()
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus(
        "List stylists",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST],
        STYLIST_MODULE_NAME,
        CommonSearchResponseDto,
        StylistResponseDto
    )
    async findList(
        @Query() query: ListStylistRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<StylistResponseDto>>> {
        return this.stylistService.findList(query);
    }

    @Get("dropdown")
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.READ })
    @ApiOperation({
        summary: "Stylist dropdown",
        description: "Id and display name for assign-staff and filter controls (userType STYLIST only)"
    })
    @ApiResponseStatus(
        "Stylist dropdown",
        [HttpStatus.OK],
        STYLIST_MODULE_NAME,
        CommonSearchResponseDto,
        CommonDropdownResponseDto
    )
    async getDropdown(
        @Query() query: StylistDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        return this.stylistService.findDropdown(query);
    }

    @Get(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.READ })
    @ApiParam({ name: "id", description: "Stylist user ID" })
    @ApiResponseStatus(
        "Get stylist",
        [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST],
        STYLIST_MODULE_NAME,
        StylistResponseDto
    )
    async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<StylistResponseDto>> {
        return this.stylistService.findById(id);
    }

    @Post()
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiResponseStatus(
        "Create stylist",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
        STYLIST_MODULE_NAME,
        StylistResponseDto
    )
    async create(@Body() dto: CreateStylistRequestDto): Promise<AppResponse<StylistResponseDto>> {
        return this.stylistService.create(dto);
    }

    @Put(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiParam({ name: "id", description: "Stylist user ID" })
    @ApiResponseStatus(
        "Update stylist",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        STYLIST_MODULE_NAME,
        StylistResponseDto
    )
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateStylistRequestDto
    ): Promise<AppResponse<StylistResponseDto>> {
        return this.stylistService.update(id, dto);
    }

    @Delete(":id")
    @RequirePermissions({ module: MODULE_CONSTANTS.STYLIST, permission: PERMISSION_CONSTANTS.DELETE })
    @ApiParam({ name: "id", description: "Stylist user ID" })
    @ApiResponseStatus("Delete stylist", [HttpStatus.OK, HttpStatus.NOT_FOUND], STYLIST_MODULE_NAME)
    async remove(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<Record<string, never>>> {
        return this.stylistService.remove(id);
    }
}
