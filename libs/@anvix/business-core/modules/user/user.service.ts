import { AppResponse, CommonDropdownResponseDto, CommonSearchResponseDto } from "@business-core-dto";
import { CacheKeyConstant, CacheModulePrefix, SuccessConstant } from "@core-constants";
import { User } from "@core-database";
import { ModuleNames, UserStatus, UserTypeEnum } from "@core-enums";
import { AppCacheService, AppMailerService } from "@core-shared-modules";
import { GenerateLogPrefix, GetCacheKey, MapToModuleName } from "@core-utilities";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateUserRequestDto } from "./dto/request/create-user.request.dto";
import { ListUserRequestDto } from "./dto/request/list-user.request.dto";
import { UpdateUserRequestDto } from "./dto/request/update-user.request.dto";
import { UserDropdownRequestDto } from "./dto/request/user-dropdown.request.dto";
import { UserResponseDto } from "./dto/response";
import { UserRepository } from "./user.repository";

/**
 * Handles user CRUD operations and profile management
 */
@Injectable()
export class UserService {
    readonly #logger: Logger = new Logger(UserService.name);
    private readonly USER_CACHE_MODULE = CacheModulePrefix.User;
    private readonly CACHE_TTL = CacheKeyConstant.DefaultTTL;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly appCacheService: AppCacheService,
        private readonly appMailerService: AppMailerService
    ) {}

    // #region API Support Methods

    /**
     * Create a new user
     * @param createUserData - User creation data
     * @returns Promise of AppResponse with created user
     */
    async create(createUserData: CreateUserRequestDto): Promise<AppResponse<UserResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.create.name);

        this.#logger.debug(`${logPrefix} : Creating new user with email: ${createUserData.email}`);

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(createUserData.email, createUserData.userType);
        if (existingUser) {
            throw new BadRequestException({ message: "ERR_EMAIL_EXISTS" });
        }

        // Create user entity - password will be auto-hashed by entity lifecycle hook
        const user = this.userRepository.create({
            ...createUserData,
            status: UserStatus.ACTIVE
        });

        const savedUser = await this.userRepository.save(user);

        this.#logger.debug(`${logPrefix} : User created successfully with ID: ${(savedUser as any).id}`);

        if (createUserData.userType == UserTypeEnum.USER) {
            await this.appMailerService.sendUserOnboardingEmail(savedUser);
            this.#logger.debug(`${logPrefix} : User onboarding email sent successfully`);
        }

        // Clear all list caches for this module
        await this.appCacheService.clearListCachesByModule(this.USER_CACHE_MODULE);

        return new AppResponse(SuccessConstant.AddSuccessAction, new UserResponseDto(savedUser), {
            module: MapToModuleName(ModuleNames.USER)
        });
    }

    /**
     * Validate email uniqueness for user update
     * @param updateUserData - User update data
     * @param user - Existing user entity
     * @param id - User ID being updated
     */
    private async validateEmailUniqueness(updateUserData: UpdateUserRequestDto, user: User, id: string): Promise<void> {
        if (updateUserData.email && updateUserData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateUserData.email, user.userType);
            if (existingUser && existingUser.id !== id) {
                throw new BadRequestException({ message: "ERR_EMAIL_EXISTS" });
            }
        }
    }

    /**
     * Update user details
     * @param id - User ID
     * @param updateUserData - User update data
     * @returns Promise of AppResponse with updated user
     */
    async update(id: string, updateUserData: UpdateUserRequestDto): Promise<AppResponse<UserResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.update.name);

        this.#logger.debug(`${logPrefix} : Updating user with ID: ${id}`);

        // Find and validate user exists
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        // Validate email uniqueness if email is being updated
        await this.validateEmailUniqueness(updateUserData, user, id);

        // Update user data with converted entities
        Object.assign(user, updateUserData);
        const updatedUser = await this.userRepository.save(user);

        this.#logger.debug(`${logPrefix} : User updated successfully with ID: ${id}`);

        // Clear detail cache for this user
        await this.appCacheService.del(GetCacheKey(this.USER_CACHE_MODULE, id));

        // Clear all list caches for this module
        await this.appCacheService.clearListCachesByModule(this.USER_CACHE_MODULE);

        return new AppResponse(SuccessConstant.UpdateSuccessAction, new UserResponseDto(updatedUser), {
            module: MapToModuleName(ModuleNames.USER)
        });
    }

    /**
     * Soft delete user
     * @param id - User ID
     * @returns Promise of AppResponse
     */
    async remove(id: string): Promise<AppResponse<{}>> {
        const logPrefix = GenerateLogPrefix(this.remove.name);

        this.#logger.debug(`${logPrefix} : Soft deleting user with ID: ${id}`);

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        await this.userRepository.softRemove(user);

        // Clear detail cache for this user
        await this.appCacheService.del(GetCacheKey(this.USER_CACHE_MODULE, id));

        // Clear all list caches for this module
        await this.appCacheService.clearListCachesByModule(this.USER_CACHE_MODULE);

        this.#logger.debug(`${logPrefix} : User soft deleted successfully with ID: ${id}`);

        return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, { module: MapToModuleName(ModuleNames.USER) });
    }

    /**
     * Find user by ID
     * @param id - User ID
     * @returns Promise of AppResponse with user data
     */
    async findById(id: string): Promise<AppResponse<UserResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.findById.name);
        const cacheKey = GetCacheKey(this.USER_CACHE_MODULE, id);

        this.#logger.debug(`${logPrefix} : Finding user by ID: ${id}`);

        // Check cache first
        const cachedData = await this.appCacheService.get<UserResponseDto>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : User found in cache`);
            return new AppResponse(SuccessConstant.DetailFetch, cachedData, {
                module: MapToModuleName(ModuleNames.USER)
            });
        }

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        const response = new UserResponseDto(user);

        // Cache the response
        await this.appCacheService.set(cacheKey, response, this.CACHE_TTL);

        this.#logger.debug(`${logPrefix} : User found and cached`);

        return new AppResponse(SuccessConstant.DetailFetch, response, { module: MapToModuleName(ModuleNames.USER) });
    }

    /**
     * Find users with search, filter, pagination, and sorting
     * @param searchRequest - List user request parameters with role and status filters
     * @returns Promise of AppResponse with user list
     */
    async findList(searchRequest: ListUserRequestDto): Promise<AppResponse<CommonSearchResponseDto<UserResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.findList.name);
        const cacheKey = GetCacheKey(this.USER_CACHE_MODULE, "list", true, searchRequest);

        this.#logger.debug(`${logPrefix} : Finding users list`);

        // Check cache first
        const cachedData = await this.appCacheService.get<CommonSearchResponseDto<UserResponseDto>>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : Users list found in cache`);
            return new AppResponse(SuccessConstant.ListFetch, cachedData, {
                module: MapToModuleName(ModuleNames.USER)
            });
        }

        const [users, total] = await this.userRepository.findUsers(searchRequest);

        // Map User entities to UserResponseDto
        const result = users.map((user) => new UserResponseDto(user));

        const response = new CommonSearchResponseDto(
            result,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        // Cache the response
        await this.appCacheService.set(cacheKey, response, this.CACHE_TTL, { module: this.USER_CACHE_MODULE });

        this.#logger.debug(`${logPrefix} : Users list retrieved and cached successfully`);

        return new AppResponse(SuccessConstant.ListFetch, response, { module: MapToModuleName(ModuleNames.USER) });
    }

    /**
     * Find users for dropdown with caching
     * @param searchRequest - Dropdown request parameters
     * @returns Promise of AppResponse with dropdown data
     */
    async findDropdown(
        searchRequest: UserDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<CommonDropdownResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.findDropdown.name);
        const cacheKey = GetCacheKey(this.USER_CACHE_MODULE, "dropdown", true, searchRequest);

        this.#logger.debug(`${logPrefix} : Finding user dropdown data`);

        // Check cache first
        const cachedData = await this.appCacheService.get<CommonSearchResponseDto<CommonDropdownResponseDto>>(cacheKey);
        if (cachedData) {
            this.#logger.debug(`${logPrefix} : Dropdown data found in cache`);
            return new AppResponse(SuccessConstant.ListFetch, cachedData, {
                module: MapToModuleName(ModuleNames.USER)
            });
        }

        // Fetch from database
        const [users, total] = await this.userRepository.findDropdown(searchRequest);

        // Map to dropdown response DTOs - repository already provides id and computed name
        const dropdownResponses = users.map((user) => new CommonDropdownResponseDto(user));

        const response = new CommonSearchResponseDto<CommonDropdownResponseDto>(
            dropdownResponses,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        // Cache the response
        await this.appCacheService.set(cacheKey, response, this.CACHE_TTL, { module: this.USER_CACHE_MODULE });

        this.#logger.debug(`${logPrefix} : Dropdown data fetched and cached`);

        return new AppResponse(SuccessConstant.ListFetch, response, { module: MapToModuleName(ModuleNames.USER) });
    }

    // #endregion

    // #region Cross-Module Support Methods

    /**
     * Find user by email address (for AuthService)
     * @param email - User email
     * @param userType - Optional user type filter
     * @returns Promise of User or null
     */
    async findUserByEmail(email: string, userType?: UserTypeEnum): Promise<User | null> {
        return this.userRepository.findByEmail(email, userType);
    }

    /**
     * Update user status (for AuthService OTP verification)
     * @param userId - User ID
     * @param status - New user status
     * @returns Promise of updated User
     */
    async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.USER)
            });
        }
        user.status = status;
        return this.userRepository.save(user);
    }

    /**
     * Update user password (for AuthService password change/reset)
     * @param userId - User ID
     * @param newPassword - New password (will be auto-hashed)
     * @returns Promise of void
     */
    async updateUserPassword(userId: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.USER)
            });
        }
        await user.updatePassword(newPassword);
        await this.userRepository.save(user);
    }

    /**
     * Save user entity (for AuthService after user modifications)
     * @param user - User entity to save
     * @returns Promise of saved User
     */
    async saveUser(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    /**
     * Check if user exists by ID (for cross-module validation)
     * @param id - User ID
     * @returns Promise of boolean
     */
    async exists(id: string): Promise<boolean> {
        const user = await this.userRepository.findById(id);
        return !!user;
    }

    /**
     * Find multiple users by IDs (for RoleService)
     * @param ids - Array of User IDs
     * @returns Promise of User array
     */
    async findUsersByIds(ids: string[]): Promise<User[]> {
        return this.userRepository.find({ where: ids.map((id) => ({ id })) });
    }

    /**
     * Find users by IDs with role loaded (for service-staff assignment validation)
     */
    async findStaffUsersByIds(ids: string[]): Promise<User[]> {
        return this.userRepository.findByIdsWithRole(ids);
    }

    /**
     * Find multiple users by emails
     * @param emails - Array of emails
     * @returns Promise of User array
     */
    async findUsersByEmails(emails: string[]): Promise<User[]> {
        return this.userRepository.find({ where: emails.map((email) => ({ email })) });
    }

    /**
     * Update user role (for RoleService)
     * @param userId - User ID or array of IDs
     * @param roleId - Role ID to assign (or null to remove)
     */
    async updateUserRole(userId: string | string[], roleId: string | null): Promise<void> {
        const ids = Array.isArray(userId) ? userId : [userId];
        await this.userRepository.update(ids as any, { roleId } as any);
    }
    // #endregion
}
