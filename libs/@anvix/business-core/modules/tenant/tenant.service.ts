import { AppResponse, CommonDropdownRequestDto, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { Role, Tenant, User } from "@core-database";
import { ModuleNames, SystemRoleType, TenantStatus, UserStatus, UserTypeEnum } from "@core-enums";
import { GenerateLogPrefix, MapToModuleName } from "@core-utilities";
import { AppS3Service } from "@core-shared-modules";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EntityManager } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { CreateTenantRequestDto, ListTenantRequestDto, UpdateTenantRequestDto } from "./dto";
import { TenantDropdownResponseDto, TenantPublicResponseDto, TenantResponseDto } from "./dto/response";
import { seedServiceCatalogForTenant } from "../service-catalog/seed-service-catalog.helper";
import { TenantRepository } from "./tenant.repository";
import { extname } from "path";

/**
 * Validates a subdomain string.
 * Rules:
 * - Must not be divided by "." (single level)
 * - Must not be empty
 * - Should be URL-safe: start/end with alphanumeric, can contain hyphens.
 * @param subdomain - Subdomain string to validate
 * @returns boolean - True if valid
 */
const ValidateSubdomain = (subdomain: string): boolean => {
    if (!subdomain || typeof subdomain !== "string") return false;

    // Rule: Must not contain dots
    if (subdomain.includes(".")) return false;

    // Regex: alphanumeric start/end, hyphens allowed in middle. 1-63 chars.
    // Case insensitive.
    const validRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

    return validRegex.test(subdomain);
};

/**
 * Service class for Tenant entity operations
 * Handles business logic for tenant management
 */
@Injectable()
export class TenantService {
    private readonly logger: Logger = new Logger(TenantService.name);

    constructor(
        private readonly tenantRepository: TenantRepository,
        private readonly configService: ConfigService,
        private readonly s3Utility: AppS3Service
    ) {}

    /**
     * Extract subdomain from origin or host header
     * @param originOrHost - The origin (e.g., http://demo.sportsengine.com) or host (e.g., demo.sportsengine.com)
     * @returns The subdomain string or null if not found
     */
    extractSubdomain(originOrHost: string): string | null {
        if (!originOrHost || typeof originOrHost !== "string") return null;

        // Remove protocol and trailing paths/slash
        let base = originOrHost.replace(/^https?:\/\//, "").split("/")[0];

        // Remove port if present
        base = base.split(":")[0];

        // Localhost logic: bypass main domain check for local dev
        // Matches domains ending in "localhost" or straight IP "127.0.0.1" (though usually IPs don't have subdomains in this context)
        if (base.endsWith("localhost")) {
            const parts = base.split(".");
            if (parts.length > 1 && parts[0] !== "localhost") {
                return parts[0];
            }
            return null;
        }

        // Use NestJS ConfigService for main domain (best practice)
        const mainDomain = this.configService.get<string>("MAIN_DOMAIN");

        // Validate mainDomain: must be a non-empty string
        if (mainDomain && typeof mainDomain === "string" && mainDomain.trim()) {
            // Ensure suffix starts with dot
            const domainSuffix = mainDomain.startsWith(".") ? mainDomain : `.${mainDomain}`;

            if (base.endsWith(domainSuffix)) {
                const subdomain = base.slice(0, -domainSuffix.length);

                // Validate the extracted subdomain using the common validator
                if (!ValidateSubdomain(subdomain)) {
                    return null;
                }

                return subdomain;
            }
            // If main domain is configured but doesn't match host, return null
            return null;
        }

        // Fallback Logic when MAIN_DOMAIN is not set
        // Heuristic: take the first part if there are more than 2 parts (e.g., sub.domain.com)
        const parts = base.split(".");
        if (parts.length > 2) {
            return parts[0];
        }

        return null;
    }

    /**
     * Seed roles for a new tenant
     * @param manager - Entity manager for transaction
     * @param tenantId - Tenant ID
     * @returns Promise with result containing super admin role
     */
    private async seedRoles(manager: EntityManager, tenantId: string) {
        const commonPermissions = {
            read: true,
            write: true,
            edit: true,
            delete: true
        };

        const allModules = ["User", "Auth", "Role", "ServiceCategory", "Service", "Stylist", "Skill"];

        // Permissions for Super Admin (All modules)
        const superAdminPermissions = allModules.map((module) => ({ module, permissions: commonPermissions }));

        // Permissions for Admin (All except Role - based on seed description,
        // Admin: Excludes Role.
        const adminModules = allModules.filter((m) => m !== "Role");
        const adminPermissions = adminModules.map((module) => ({ module, permissions: commonPermissions }));

        const rolesToSeed = [
            {
                name: "Super Admin",
                description: "Super administrator with full access to all modules",
                permissions: superAdminPermissions,
                systemRoleType: SystemRoleType.SUPER_ADMIN
            },
            {
                name: "Admin",
                description: "Administrator with access to all modules except role management",
                permissions: adminPermissions,
                systemRoleType: SystemRoleType.ADMIN
            }
        ];

        const result: { superAdminRole?: Role } = {};

        for (const roleData of rolesToSeed) {
            const role = manager.create(Role, {
                ...roleData,
                isActive: true,
                tenantId // Explicitly set tenantId
            });
            const savedRole = await manager.save(role);

            if (roleData.name === "Super Admin") {
                result.superAdminRole = savedRole;
            }
        }

        return result;
    }

    /**
     * Seed super admin user for a new tenant
     * @param manager - Entity manager for transaction
     * @param tenantId - Tenant ID
     * @param superAdminRole - Super admin role
     * @param adminEmail - Admin email
     * @param adminPassword - Admin password
     */
    private async seedSuperAdmin(
        manager: EntityManager,
        tenantId: string,
        superAdminRole: Role,
        adminEmail: string,
        adminPassword: string
    ) {
        // Create user with implicit password hashing via BeforeInsert hook
        const user = manager.create(User, {
            firstName: "Super",
            lastName: "Admin",
            email: adminEmail,
            password: adminPassword, // Will be hashed by entity lifecycle hook
            userType: UserTypeEnum.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            role: superAdminRole,
            roleId: superAdminRole.id, // Set both for safety
            tenantId
        });

        await manager.save(user);
    }

    /**
     * Seed a sample stylist user for quick booking flow testing.
     * Uses tenant subdomain in email to keep uniqueness across tenants.
     */
    private async seedSampleStylist(
        manager: EntityManager,
        tenantId: string,
        tenantSubdomain: string
    ): Promise<void> {
        const seedEmail = `john.smith+${tenantSubdomain}@yopmail.com`;

        const existingStylist = await manager.findOne(User, {
            where: {
                email: seedEmail,
                userType: UserTypeEnum.STYLIST
            } as any
        });
        if (existingStylist) {
            return;
        }

        const stylistUser = manager.create(User, {
            firstName: "John",
            lastName: "Smith",
            email: seedEmail,
            password: "$2b$10$qz6qDHh8GLAaupOXFhKroeCcRBlGnQBX3IX5L2pCfiRyh8Cua0FnS",
            salt: "$2b$10$qz6qDHh8GLAaupOXFhKroe",
            userType: UserTypeEnum.STYLIST,
            status: UserStatus.ACTIVE,
            experienceYears: 5,
            tenantId
        });

        await manager.save(stylistUser);
    }

    /**
     * Resolve tenant by subdomain
     * @param subdomain - Tenant subdomain
     * @returns Promise of AppResponse with public tenant data
     */
    async getTenantBySubdomain(subdomain: string): Promise<AppResponse<TenantPublicResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.getTenantBySubdomain.name);
        this.logger.debug(`${logPrefix} : Resolving tenant by subdomain: ${subdomain}`);

        if (!subdomain) {
            // No subdomain found (e.g. localhost or base domain) -> implies Product Owner mode
            const response = new TenantPublicResponseDto({ isProductOwner: true });
            return new AppResponse(SuccessConstant.DetailFetch, response, {
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        const tenant = await this.tenantRepository.findBySubdomain(subdomain);
        if (!tenant) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        const response = new TenantPublicResponseDto(tenant);
        return new AppResponse(SuccessConstant.DetailFetch, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Create a new tenant
     * @param createTenantDto - Tenant creation data
     * @returns Promise of AppResponse with created tenant
     */
    async create(createTenantDto: CreateTenantRequestDto, logoFile?: any): Promise<AppResponse<TenantResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.create.name);
        this.logger.debug(`${logPrefix} : Creating new tenant: ${createTenantDto.name}`);

        // Check subdomain uniqueness
        const existingTenant = await this.tenantRepository.findOne({
            where: { subdomain: createTenantDto.subdomain }
        });
        if (existingTenant) {
            throw new BadRequestException({ message: "ERR_SUBDOMAIN_EXISTS" });
        }

        // Handle logo upload if provided
        let logoFileName: string | undefined;
        if (logoFile) {
            logoFileName = await this.uploadLogo(logoFile);
        }

        // Use transaction to create tenant, roles, and super admin user
        return await this.tenantRepository.manager.transaction(async (manager) => {
            // Create tenant
            const tenant = manager.create(Tenant, {
                name: createTenantDto.name,
                subdomain: createTenantDto.subdomain,
                config: createTenantDto.config,
                logo: logoFileName
            });
            const savedTenant = await manager.save(tenant);

            // Seed roles for the tenant
            const roleResult = await this.seedRoles(manager, savedTenant.id);

            // Seed super admin user
            if (roleResult.superAdminRole) {
                await this.seedSuperAdmin(
                    manager,
                    savedTenant.id,
                    roleResult.superAdminRole,
                    createTenantDto.email,
                    createTenantDto.password
                );
            }

            await this.seedSampleStylist(manager, savedTenant.id, savedTenant.subdomain);
            await seedServiceCatalogForTenant(manager, savedTenant.id);

            const response = new TenantResponseDto(savedTenant);
            return new AppResponse(SuccessConstant.AddSuccessAction, response, {
                module: MapToModuleName(ModuleNames.TENANT)
            });
        });
    }

    /**
     * Update tenant details
     * @param id - Tenant ID
     * @param updateTenantDto - Tenant update data
     * @param logoFile - Optional logo file
     * @returns Promise of AppResponse with updated tenant
     */
    async update(id: string, updateTenantDto: UpdateTenantRequestDto, logoFile?: any): Promise<AppResponse<TenantResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.update.name);
        this.logger.debug(`${logPrefix} : Updating tenant ID: ${id}`);

        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        // Check subdomain uniqueness if updating
        if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
            const existingTenant = await this.tenantRepository.findOne({
                where: { subdomain: updateTenantDto.subdomain }
            });
            if (existingTenant) {
                throw new BadRequestException({ message: "ERR_SUBDOMAIN_EXISTS" });
            }
        }

        // Handle logo upload if provided
        if (logoFile) {
            const logoFileName = await this.uploadLogo(logoFile);

            // Remove old logo if exists
            if (tenant.logo) {
                await this.removeOldLogo(tenant.logo);
            }

            // Set new logo filename on tenant entity
            tenant.logo = logoFileName;
        }

        Object.assign(tenant, updateTenantDto);
        const updatedTenant = await this.tenantRepository.save(tenant);

        const response = new TenantResponseDto(updatedTenant);
        return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Deactivate a tenant
     * @param id - Tenant ID
     * @returns Promise of AppResponse with updated tenant
     */
    async deactivate(id: string): Promise<AppResponse<TenantResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.deactivate.name);
        this.logger.debug(`${logPrefix} : Deactivating tenant ID: ${id}`);

        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        if (tenant.status === TenantStatus.INACTIVE) {
            throw new BadRequestException({ message: "ERR_TENANT_ALREADY_INACTIVE" });
        }

        tenant.status = TenantStatus.INACTIVE;
        const updatedTenant = await this.tenantRepository.save(tenant);

        const response = new TenantResponseDto(updatedTenant);
        return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Activate a tenant
     * @param id - Tenant ID
     * @returns Promise of AppResponse with updated tenant
     */
    async activate(id: string): Promise<AppResponse<TenantResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.activate.name);
        this.logger.debug(`${logPrefix} : Activating tenant ID: ${id}`);

        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        if (tenant.status === TenantStatus.ACTIVE) {
            throw new BadRequestException({ message: "ERR_TENANT_ALREADY_ACTIVE" });
        }

        tenant.status = TenantStatus.ACTIVE;
        const updatedTenant = await this.tenantRepository.save(tenant);

        const response = new TenantResponseDto(updatedTenant);
        return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Find tenants list
     * @param searchRequest - List tenant request parameters
     * @returns Promise of AppResponse with tenant list
     */
    async findList(
        searchRequest: ListTenantRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<TenantResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.findList.name);
        this.logger.debug(`${logPrefix} : Finding tenants list`);

        const [tenants, total] = await this.tenantRepository.findTenants(searchRequest);

        const results = tenants.map((t) => new TenantResponseDto(t));
        const response = new CommonSearchResponseDto(
            results,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        return new AppResponse(SuccessConstant.ListFetch, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Get tenant by ID
     * @param id - Tenant ID
     * @returns Promise of AppResponse with tenant data
     */
    async findById(id: string): Promise<AppResponse<TenantResponseDto>> {
        const logPrefix = GenerateLogPrefix(this.findById.name);
        this.logger.debug(`${logPrefix} : Finding tenant by ID: ${id}`);

        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleNames.TENANT)
            });
        }

        const response = new TenantResponseDto(tenant);
        return new AppResponse(SuccessConstant.DetailFetch, response, {
            module: MapToModuleName(ModuleNames.TENANT)
        });
    }

    /**
     * Find active tenants for dropdown with search and pagination
     * @param searchRequest - Dropdown request parameters
     * @returns Promise of AppResponse with dropdown data
     */
    async findDropdown(
        searchRequest: CommonDropdownRequestDto
    ): Promise<AppResponse<CommonSearchResponseDto<TenantDropdownResponseDto>>> {
        const logPrefix = GenerateLogPrefix(this.findDropdown.name);
        this.logger.debug(`${logPrefix} : Finding active tenants for dropdown`);

        const [tenants, total] = await this.tenantRepository.findDropdownTenants(searchRequest);
        const cloudFrontUrl = this.configService.get<string>("cloudfront.url") || "";

        // Map raw results to dropdown response DTOs using the DTO's constructor
        const dropdownResponses = tenants.map((tenant) => new TenantDropdownResponseDto(tenant, total, cloudFrontUrl));

        const response = new CommonSearchResponseDto<TenantDropdownResponseDto>(
            dropdownResponses,
            searchRequest.pageSize || 10,
            searchRequest.pageNumber || 1,
            total
        );

        return new AppResponse(SuccessConstant.ListFetch, response, { module: MapToModuleName(ModuleNames.TENANT) });
    }

    // #region Helper Methods

    /**
     * Upload logo to S3
     * @param file - Logo file
     * @returns Promise<string> - Filename
     */
    private async uploadLogo(file: any): Promise<string> {
        // Validate file type
        const fileExtension = extname(file.originalname).toLowerCase();
        const allowedTypes = [".jpg", ".jpeg", ".png", ".svg", ".webp"];
        if (!allowedTypes.includes(fileExtension)) {
            throw new BadRequestException({ message: "ERR_INVALID_FILE_TYPE" });
        }

        const fileNameOnly = `${uuidv4()}${fileExtension}`;
        const filePathWithFolder = `tenants/logos/${fileNameOnly}`;
        await this.s3Utility.uploadS3(file.buffer, this.s3Utility.privateBucketName, filePathWithFolder, file.mimetype);
        return fileNameOnly;
    }

    /**
     * Remove old logo from S3
     * @param fileName - Filename to remove
     */
    private async removeOldLogo(fileName: string): Promise<void> {
        if (!fileName) return;
        const filePathWithFolder = `tenants/logos/${fileName}`;
        await this.s3Utility.deleteFileFromS3(filePathWithFolder, this.s3Utility.privateBucketName);
    }



    //#endregion

    // #region Cross-Module Support Methods

    /**
     * Find active tenants (for CronService and other modules)
     * @returns Promise<Tenant[]> - Array of active tenants
     */
    async findAllActive(): Promise<Tenant[]> {
        const logPrefix = GenerateLogPrefix(this.findAllActive.name);
        this.logger.debug(`${logPrefix} : Finding all active tenants`);
        return this.tenantRepository.find({
            where: { status: TenantStatus.ACTIVE }
        });
    }

    /**
     * Find tenant by ID (for other modules)
     * @param id - Tenant ID
     * @returns Promise<Tenant | null> - Tenant entity or null
     */
    async findOneById(id: string): Promise<Tenant | null> {
        return this.tenantRepository.findOne({ where: { id } });
    }

    // #endregion
}
