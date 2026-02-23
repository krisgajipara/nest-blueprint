import {
    AppResponse,
    CommonDropdownRequestDto,
    CommonDropdownResponseDto,
    CommonSearchResponseDto
} from "@business-core-dto";
import { ListRoleRequestDto, UpdateRoleRequestDto } from "@business-core-modules";
import { DEFAULT_PERMISSIONS, getAvailableModules, SuccessConstant } from "@core-constants";
import { Role, RolePermission, User } from "@core-database";
import { ModuleNames, SystemRoleType } from "@core-enums";
import { AppCacheService, AppPermissionService } from "@core-shared-modules";
import { GenerateLogPrefix, GetCacheKey, MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import {
    DefaultPermissionsResponseDto,
    RoleDetailResponseDto,
    RoleListResponseDto
} from "./dto/response/role.response.dto";
import { RoleRepository } from "./role.repository";

/**
 * Simplified Role service for role management
 * Manages roles with JSON permissions stored directly in role table
 */
@Injectable()
export class RoleService {
    readonly #logger: Logger = new Logger(RoleService.name);
    private readonly ROLE_CACHE_MODULE = "role";
    private readonly CACHE_TTL = 360; // 6 minutes

    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly userService: UserService,
        private readonly appCacheService: AppCacheService,
        private readonly appPermissionService: AppPermissionService
    ) { }

    /**
     * Create a new role with permissions
     */
    async createRole(
        name: string,
        description: string | undefined,
        permissions: RolePermission[]
    ): Promise<AppResponse<Role>> {
        const logPrefix = GenerateLogPrefix(this.createRole.name);

        this.#logger.debug(`${logPrefix} : Creating role: ${name}`);

        // Check if role already exists
        const existingRole = await this.roleRepository.findOne({ where: { name } });
        if (existingRole) {
            throw new BadRequestException({ message: "ERR_ROLE_EXISTS" });
        }

        const role = this.roleRepository.create({
            name,
            description,
            permissions,
            isActive: true,
            systemRoleType: null
        });

        const savedRole = await this.roleRepository.save(role);

        // Clear all list caches for this module since new role might affect dropdowns
        await this.appCacheService.clearListCachesByModule(this.ROLE_CACHE_MODULE);

        this.#logger.debug(`${logPrefix} : Role created successfully: ${savedRole.id}`);

        return new AppResponse(SuccessConstant.AddSuccessAction, savedRole, {
            module: MapToModuleName(ModuleNames.ROLE)
        });
    }

    /**
     * Update role permissions and description (but not name)
     */
    async updateRolePermissions(id: string, updateRoleDto: UpdateRoleRequestDto): Promise<AppResponse<Role>> {
        const logPrefix = GenerateLogPrefix(this.updateRolePermissions.name);

        this.#logger.debug(`${logPrefix} : Updating role details for role: ${id}`);

        const role = await this.roleRepository.findOne({ where: { id } });

        if (!role) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: "Role" });
        }

        // Update description and permissions, but explicitly do not update name
        if (updateRoleDto.description !== undefined) {
            role.description = updateRoleDto.description;
        }
        if (updateRoleDto.permissions !== undefined) {
            role.permissions = updateRoleDto.permissions;
        }

        role.name = updateRoleDto.name ?? role.name;
        role.permissions = updateRoleDto.permissions ?? role.permissions;

        const updatedRole = await this.roleRepository.save(role);

        // Clear detail cache for this role
        await this.appCacheService.del(GetCacheKey(this.ROLE_CACHE_MODULE, id));

        // Clear all list caches for this module
        await this.appCacheService.clearListCachesByModule(this.ROLE_CACHE_MODULE);

        this.#logger.debug(`${logPrefix} : Role updated successfully: ${id}`);

        return new AppResponse(SuccessConstant.UpdateSuccessAction, updatedRole, {
            module: MapToModuleName(ModuleNames.ROLE)
        });
    }

    /**
     * Get role by ID (with permissions for detail view)
     */
    async getRoleById(id: string): Promise<AppResponse<RoleDetailResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.getRoleById.name);
        const cacheKey = GetCacheKey(this.ROLE_CACHE_MODULE, id);

        this.#logger.debug(`${logPrefix} : Getting role by ID: ${id}`);

        // Check cache first
        const cachedData = await this.appCacheService.get<RoleDetailResponseDto>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : Role found in cache`);
            return new AppResponse(SuccessConstant.DetailFetch, cachedData, {
                module: MapToModuleName(ModuleNames.ROLE)
            });
        }

        const role = await this.roleRepository.findOne({ where: { id, isActive: true } });
        if (!role) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.ROLE) });
        }

        // Map to detail response DTO (with permissions)
        const roleDetail = new RoleDetailResponseDto(role);

        // Cache the response
        await this.appCacheService.set(cacheKey, roleDetail, this.CACHE_TTL);

        this.#logger.debug(`${logPrefix} : Role retrieved and cached successfully: ${id}`);

        return new AppResponse(SuccessConstant.DetailFetch, roleDetail, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Get all active roles with search, filter, pagination, and sorting (without permissions for performance)
     */
    async getAllRoles(
        searchRequest: ListRoleRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<RoleListResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.getAllRoles.name);
        const cacheKey = GetCacheKey(this.ROLE_CACHE_MODULE, "list", true, searchRequest);

        this.#logger.debug(`${logPrefix} : Getting roles with search and pagination`);

        // Check cache first
        const cachedData = await this.appCacheService.get<CommonSearchResponseDto<RoleListResponseDto>>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : Roles list found in cache`);
            return new AppResponse(SuccessConstant.ListFetch, cachedData, { module: MapToModuleName(ModuleNames.ROLE) });
        }

        const [roles, total] = await this.roleRepository.findRoles(searchRequest);

        // Map to list response DTO (without permissions)
        const roleList = roles.map((role) => new RoleListResponseDto(role));

        const response = new CommonSearchResponseDto(
            roleList,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        // Cache the response
        await this.appCacheService.set(cacheKey, response, this.CACHE_TTL, { module: this.ROLE_CACHE_MODULE });

        this.#logger.debug(`${logPrefix} : Retrieved ${roleList.length} roles out of ${total} and cached`);

        return new AppResponse(SuccessConstant.ListFetch, response, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Get roles for dropdown with search, filter, pagination, and sorting
     * Includes SUPER_ADMIN role only for super-admin users
     * @param searchRequest - List role request parameters
     * @param user - Current authenticated user
     * @returns Promise of AppResponse with role dropdown data
     */
    async findDropdown(
        searchRequest: CommonDropdownRequestDto,
        user: any
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.findDropdown.name);

        // Determine if user is super-admin
        const isSuperAdmin = await this.isUserSuperAdmin(user);
        const cacheKey = GetCacheKey(this.ROLE_CACHE_MODULE, `dropdown-${isSuperAdmin}`, true, searchRequest);

        this.#logger.debug(`${logPrefix} : Finding roles dropdown data (user: ${user?.id}, isSuperAdmin: ${isSuperAdmin})`);

        // Check cache first
        const cachedData = await this.appCacheService.get<CommonSearchResponseDto<CommonDropdownResponseDto>>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : Dropdown data found in cache`);
            return new AppResponse(SuccessConstant.ListFetch, cachedData, { module: MapToModuleName(ModuleNames.ROLE) });
        }

        const [roles, total] = await this.roleRepository.findDropdown(searchRequest, isSuperAdmin);

        // Map to list response DTO (without permissions)
        const roleList = roles.map((role) => new CommonDropdownResponseDto({ id: role.id, name: role.name }));

        const response = new CommonSearchResponseDto(
            roleList,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        // Cache the response for 6 minutes
        await this.appCacheService.set(cacheKey, response, this.CACHE_TTL, { module: this.ROLE_CACHE_MODULE });

        this.#logger.debug(`${logPrefix} : Retrieved ${roleList.length} roles for dropdown and cached out of ${total}`);

        return new AppResponse(SuccessConstant.ListFetch, response, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Delete role (soft delete)
     */
    async deleteRole(id: string): Promise<AppResponse<{}>> {
        const logPrefix = GenerateLogPrefix(this.deleteRole.name);

        this.#logger.debug(`${logPrefix} : Deleting role: ${id}`);

        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.ROLE) });
        }

        // Check if it's a system role that cannot be deleted
        const protectedSystemRoles = [SystemRoleType.SUPER_ADMIN, SystemRoleType.ADMIN];
        if (role.systemRoleType && protectedSystemRoles.includes(role.systemRoleType)) {
            throw new BadRequestException({ message: "ERR_CANNOT_DELETE_SYSTEM_ROLE" });
        }

        await this.roleRepository.update(id, { isActive: false });

        // Clear detail cache for this role
        await this.appCacheService.del(GetCacheKey(this.ROLE_CACHE_MODULE, id));

        // Clear all list caches for this module
        await this.appCacheService.clearListCachesByModule(this.ROLE_CACHE_MODULE);

        this.#logger.debug(`${logPrefix} : Role deleted successfully: ${id}`);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Assign role to multiple users
     */
    async assignRoleToUser(userIds: string[], roleId: string): Promise<AppResponse<{}>> {
        const logPrefix = GenerateLogPrefix(this.assignRoleToUser.name);

        this.#logger.debug(`${logPrefix} : Assigning role ${roleId} to users ${userIds.join(", ")}`);

        // Validate role exists and is active
        const role = await this.roleRepository.findOne({ where: { id: roleId, isActive: true } });
        if (!role) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.ROLE) });
        }

        // Validate all users exist
        const users = await this.userService.findUsersByIds(userIds);
        if (users.length !== userIds.length) {
            const foundIds = users.map((user) => user.id);
            const missingIds = userIds.filter((id) => !foundIds.includes(id));
            throw new NotFoundException({
                message: `ERR_MODULE_NOT_FOUND: Users with IDs ${missingIds.join(", ")} not found`,
                module: MapToModuleName(ModuleNames.USER)
            });
        }

        // Update users' roleId in batch
        await this.userService.updateUserRole(userIds, roleId);

        // Note: User caches should be invalidated by user service, not here
        // Role caches don't need to be cleared as roles themselves haven't changed

        this.#logger.debug(`${logPrefix} : Role assigned successfully to ${userIds.length} users`);

        return new AppResponse(SuccessConstant.AddSuccessAction, {}, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Remove role from user
     */
    async removeRoleFromUser(userId: string): Promise<AppResponse<{}>> {
        const logPrefix = GenerateLogPrefix(this.removeRoleFromUser.name);

        this.#logger.debug(`${logPrefix} : Removing role from user ${userId}`);

        // Validate user exists
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        // Remove roleId (set to null)
        await this.userService.updateUserRole(userId, null);

        this.#logger.debug(`${logPrefix} : Role removed successfully from user`);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Get user with role information
     */
    async getUserWithRole(userId: string): Promise<AppResponse<{ user: User; role: Role | null }>> {
        const logPrefix = GenerateLogPrefix(this.getUserWithRole.name);

        this.#logger.debug(`${logPrefix} : Getting user with role: ${userId}`);

        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        let role = null;
        if (user.roleId) {
            role = await this.roleRepository.findOne({ where: { id: user.roleId, isActive: true } });
        }

        this.#logger.debug(`${logPrefix} : User with role retrieved successfully`);

        return new AppResponse(
            SuccessConstant.DetailFetch,
            { user, role },
            { module: MapToModuleName(ModuleNames.ROLE) }
        );
    }

    /**
     * Check if user has permission (for backward compatibility with role guard)
     * @param userId - User ID
     * @param method - HTTP method (GET/POST/PUT/DELETE)
     * @param resource - Resource path
     * @returns AppResponse with hasPermission boolean
     */
    async checkUserPermission(
        userId: string,
        method: string,
        resource: string
    ): Promise<AppResponse<{ hasPermission: boolean }>> {
        const logPrefix = GenerateLogPrefix(this.checkUserPermission.name);

        this.#logger.debug(`${logPrefix} : Checking permission for user ${userId}: ${method} ${resource}`);

        // Get user with role
        const userWithRole = await this.getUserWithRole(userId);
        const role = (userWithRole.data as { user: User; role: Role | null }).role;

        if (!role?.permissions) {
            return new AppResponse(
                SuccessConstant.SuccessAction,
                { hasPermission: false },
                { module: MapToModuleName(ModuleNames.ROLE) }
            );
        }

        // Map HTTP method to permission type
        let permissionType: string;
        switch (method.toUpperCase()) {
            case "GET":
                permissionType = "read";
                break;
            case "POST":
                permissionType = "write";
                break;
            case "PUT":
            case "PATCH":
                permissionType = "edit";
                break;
            case "DELETE":
                permissionType = "delete";
                break;
            default:
                permissionType = "read";
        }

        // Extract module name from resource path (e.g., "/users" -> "USER")
        const moduleName = this.extractModuleFromResource(resource);

        // Check permission using AppPermissionService
        const hasPermission = this.appPermissionService.hasPermission(role, moduleName, permissionType);

        this.#logger.debug(`${logPrefix} : Permission check result: ${hasPermission}`);

        return new AppResponse(
            SuccessConstant.SuccessAction,
            { hasPermission },
            { module: MapToModuleName(ModuleNames.ROLE) }
        );
    }

    /**
     * Get default permissions structure for UI
     * Used for initial role creation and permission management
     */
    async getDefaultPermissions(): Promise<AppResponse<DefaultPermissionsResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.getDefaultPermissions.name);

        this.#logger.debug(`${logPrefix} : Getting default permissions structure`);

        const result = new DefaultPermissionsResponseDto({
            modules: getAvailableModules(),
            permissions: DEFAULT_PERMISSIONS
        });

        this.#logger.debug(`${logPrefix} : Default permissions retrieved successfully`);

        return new AppResponse(SuccessConstant.ListFetch, result, { module: MapToModuleName(ModuleNames.ROLE) });
    }

    /**
     * Check if the current user is a super-admin
     * @param user - Current authenticated user
     * @returns Promise of boolean indicating if user is super-admin
     */
    private async isUserSuperAdmin(user: any): Promise<boolean> {
        if (!user?.roleId) {
            return false;
        }

        try {
            const userRole = await this.roleRepository.findOne({ where: { id: user.roleId } });
            return userRole?.systemRoleType === SystemRoleType.SUPER_ADMIN;
        } catch (error) {
            this.#logger.error(`Error checking if user is super-admin: ${error}`);
            return false;
        }
    }

    /**
     * Extract module name from resource path
     * @param resource - Resource path (e.g., "/users", "/api/users")
     * @returns Module name in uppercase
     */
    private extractModuleFromResource(resource: string): string {
        // Remove leading slashes and api prefix
        const cleanResource = resource.replace(/^\/+(api\/)?/, "");

        // Get first segment and convert to uppercase
        const segments = cleanResource.split("/");
        return segments[0]?.toUpperCase() || "UNKNOWN";
    }
}
