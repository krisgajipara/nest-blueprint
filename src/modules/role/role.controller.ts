import {
    AppResponse,
    CommonDropdownRequestDto,
    CommonDropdownResponseDto,
    CommonSearchResponseDto
} from "@business-core-dto";
import {
    AssignRoleToUserRequestDto,
    CreateRoleRequestDto,
    DefaultPermissionsResponseDto,
    ListRoleRequestDto,
    RoleDetailResponseDto,
    RoleListResponseDto,
    RoleService,
    UpdateRoleRequestDto
} from "@business-core-modules";
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from "@core-constants";
import { ApiResponseStatus, GetUser, RequirePermissions } from "@core-custom-decorators";
import { RoleGuard } from "@core-custom-guards";
import { ModuleNames } from "@core-enums";
import { MapToModuleName } from "@core-utilities";
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

// Module name constants for decorators (evaluated at module load time)
const ROLE_MODULE_NAME = MapToModuleName(ModuleNames.ROLE);

/**
 * Controller for Role management operations
 * Simplified approach with JSON permissions stored in role table
 */
@ApiTags("Role")
@Controller("roles")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    /**
     * Create a new role with permissions
     */
    @Post("roles")
    @RequirePermissions({ module: MODULE_CONSTANTS.ROLE, permission: PERMISSION_CONSTANTS.WRITE })
    @ApiResponseStatus(
        "Create a new role with permissions",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
        ROLE_MODULE_NAME
    )
    async createRole(@Body() createRoleDto: CreateRoleRequestDto) {
        return this.roleService.createRole(createRoleDto.name, createRoleDto.description, createRoleDto.permissions);
    }

    /**
     * Get all roles with search, filter, pagination, and sorting (without permissions for performance)
     */
    @Get("roles")
    @RequirePermissions({ module: MODULE_CONSTANTS.ROLE, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus(
        "Get all roles with pagination, search, and filters",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST],
        ROLE_MODULE_NAME,
        CommonSearchResponseDto,
        RoleListResponseDto
    )
    async getAllRoles(
        @Query() listRoleDto: ListRoleRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<RoleListResponseDto>>> {
        return this.roleService.getAllRoles(listRoleDto);
    }

    @Get("dropdown")
    @ApiOperation({
        summary: "Get role dropdown data",
        description:
            "Returns id and name for dropdown/autocomplete with lazy loading support. Includes SUPER_ADMIN role only for super-admin users."
    })
    @ApiResponseStatus(
        "Get role dropdown data",
        [HttpStatus.OK],
        ROLE_MODULE_NAME,
        CommonSearchResponseDto,
        CommonDropdownResponseDto
    )
    async getDropdown(
        @Query() query: CommonDropdownRequestDto,
        @GetUser() user: any
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        return this.roleService.findDropdown(query, user);
    }

    /**
     * Get role by ID (with permissions for detail view)
     */
    @Get("roles/:id")
    @ApiParam({
        name: "id",
        description: "Role ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus(
        "Get role by ID with permissions",
        [HttpStatus.OK, HttpStatus.NOT_FOUND],
        ROLE_MODULE_NAME,
        RoleDetailResponseDto
    )
    async getRoleById(@Param("id") id: string) {
        return this.roleService.getRoleById(id);
    }

    /**
     * Update role with permissions
     */
    @Put("roles/:id")
    @ApiParam({
        name: "id",
        description: "Role ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus(
        "Update role with permissions",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        ROLE_MODULE_NAME
    )
    async updateRole(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleRequestDto) {
        return this.roleService.updateRolePermissions(id, updateRoleDto);
    }

    /**
     * Delete role (soft delete)
     */
    @Delete("roles/:id")
    @ApiParam({
        name: "id",
        description: "Role ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus("Delete role", [HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST], ROLE_MODULE_NAME)
    async deleteRole(@Param("id") id: string) {
        return this.roleService.deleteRole(id);
    }

    /**
     * Assign role to user
     */
    @Post("users/assign-role")
    @RequirePermissions({ module: MODULE_CONSTANTS.ROLE, permission: PERMISSION_CONSTANTS.EDIT })
    @ApiResponseStatus(
        "Assign role to user",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        ROLE_MODULE_NAME
    )
    async assignRoleToUser(@Body() assignRoleDto: AssignRoleToUserRequestDto) {
        return this.roleService.assignRoleToUser(assignRoleDto.userIds, assignRoleDto.roleId);
    }

    /**
     * Remove role from user
     */
    @Delete("users/:userId/role")
    @ApiParam({
        name: "userId",
        description: "User ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus("Remove role from user", [HttpStatus.OK, HttpStatus.NOT_FOUND], ROLE_MODULE_NAME)
    async removeRoleFromUser(@Param("userId") userId: string) {
        return this.roleService.removeRoleFromUser(userId);
    }

    /**
     * Get user with role information
     */
    @Get("users/:userId/role")
    @ApiParam({
        name: "userId",
        description: "User ID",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @ApiResponseStatus("Get user with role information", [HttpStatus.OK, HttpStatus.NOT_FOUND], ROLE_MODULE_NAME)
    async getUserWithRole(@Param("userId") userId: string) {
        return this.roleService.getUserWithRole(userId);
    }

    /**
     * Get default permissions structure for UI
     * Used for initial role creation and permission management
     */
    @Get("permissions/default")
    @RequirePermissions({ module: MODULE_CONSTANTS.ROLE, permission: PERMISSION_CONSTANTS.READ })
    @ApiResponseStatus(
        "Get default permissions structure for UI",
        [HttpStatus.OK],
        ROLE_MODULE_NAME,
        DefaultPermissionsResponseDto
    )
    async getDefaultPermissions() {
        return this.roleService.getDefaultPermissions();
    }
}
