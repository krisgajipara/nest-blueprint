import { AppResponse, CommonDropdownResponseDto, CommonSearchResponseDto } from "@business-core-dto";
import {
    CreateUserRequestDto,
    ListUserRequestDto,
    UpdateUserRequestDto,
    UserDropdownRequestDto,
    UserResponseDto,
    UserService
} from "@business-core-modules";

import { ApiResponseStatus } from "@core-custom-decorators";
import { JwtAuthGuard } from "@core-custom-guards";
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

// Module name constants for decorators (evaluated at module load time)
const USER_MODULE_NAME = MapToModuleName(ModuleNames.USER);

/**
 * Controller for user-related API endpoints
 * Handles user CRUD operations
 * Authentication endpoints moved to Auth module
 */
@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiResponseStatus(
        "List all users with pagination, search, and filters",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST],
        USER_MODULE_NAME,
        CommonSearchResponseDto,
        UserResponseDto
    )
    async findAll(@Query() query: ListUserRequestDto): Promise<AppResponse<CommonSearchResponseDto<UserResponseDto>>> {
        return this.userService.findList(query);
    }

    @Get("dropdown")
    @ApiOperation({
        summary: "Get user dropdown data",
        description: "Returns id and combined first/last name for dropdown/autocomplete with lazy loading support"
    })
    @ApiResponseStatus(
        "Get user dropdown data",
        [HttpStatus.OK],
        USER_MODULE_NAME,
        CommonSearchResponseDto,
        CommonDropdownResponseDto
    )
    async getDropdown(
        @Query() query: UserDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        return this.userService.findDropdown(query);
    }

    @Get(":id")
    @ApiParam({
        name: "id",
        description: "User ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus(
        "Get user by ID",
        [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST],
        USER_MODULE_NAME,
        UserResponseDto
    )
    async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<UserResponseDto>> {
        return this.userService.findById(id);
    }

    @Post()
    @ApiResponseStatus(
        "Create a new user",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
        USER_MODULE_NAME,
        UserResponseDto
    )
    async create(
        @Body() createUserDto: CreateUserRequestDto
    ): Promise<AppResponse<UserResponseDto>> {
        return this.userService.create(createUserDto);
    }

    @Put(":id")
    @ApiResponseStatus("Update user details", [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND], USER_MODULE_NAME, UserResponseDto)
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserRequestDto
    ): Promise<AppResponse<UserResponseDto>> {
        return this.userService.update(id, updateUserDto);
    }


    @Delete(":id")
    @ApiParam({
        name: "id",
        description: "User ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus("Soft delete user", [HttpStatus.OK, HttpStatus.NOT_FOUND], USER_MODULE_NAME)
    async remove(@Param("id", ParseUUIDPipe) id: string): Promise<AppResponse<{}>> {
        return this.userService.remove(id);
    }
}
