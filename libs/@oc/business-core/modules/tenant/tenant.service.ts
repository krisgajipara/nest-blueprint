import { AppResponse, CommonSearchResponseDto } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { Tenant } from "@core-database";
import { ModuleNames, TenantStatus } from "@core-enums";
import {
    GenerateLogPrefix,
    MapToModuleName,
    S3Utility,
    ValidateSubdomain,
} from "@core-utilities";
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { extname } from "path";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import {
    CreateTenantRequestDto,
    ListTenantRequestDto,
    UpdateTenantRequestDto,
} from "./dto";
import { TenantPublicResponseDto, TenantResponseDto } from "./dto/response";
import { TenantSeedingService } from "./tenant-seeding.service";
import { TenantRepository } from "./tenant.repository";

@Injectable()
export class TenantService {
  readonly #logger: Logger = new Logger(TenantService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tenantRepository: TenantRepository,
    private readonly tenantSeedingService: TenantSeedingService,
    private readonly s3Utility: S3Utility,
  ) {}

  /**
   * Resolve tenant by subdomain
   * @param subdomain - Tenant subdomain
   * @returns Promise of AppResponse with public tenant data
   */
  async getTenantBySubdomain(
    subdomain: string,
  ): Promise<AppResponse<TenantPublicResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.getTenantBySubdomain.name);
    this.#logger.debug(
      `${logPrefix} : Resolving tenant by subdomain: ${subdomain}`,
    );

    if (!subdomain) {
      // No subdomain found (e.g. localhost or base domain) -> implies Product Owner mode
      const response = new TenantPublicResponseDto({ isProductOwner: true });
      return new AppResponse(SuccessConstant.DetailFetch, response, {
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    const tenant = await this.tenantRepository.findBySubdomain(subdomain);
    if (!tenant) {
      throw new NotFoundException({
        message: "ERR_MODULE_NOT_FOUND",
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    const response = new TenantPublicResponseDto(
      this.buildTenantResponseData(tenant),
    );
    return new AppResponse(SuccessConstant.DetailFetch, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Create a new tenant
   * @param createTenantDto - Tenant creation data
   * @returns Promise of AppResponse with created tenant
   */
  async create(
    createTenantDto: CreateTenantRequestDto,
    logoFile?: any,
  ): Promise<AppResponse<TenantResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.create.name);
    this.#logger.debug(
      `${logPrefix} : Creating new tenant: ${createTenantDto.name}`,
    );

    // Validate subdomain format
    if (!ValidateSubdomain(createTenantDto.subdomain)) {
      throw new BadRequestException({
        message: "ERR_INVALID_SUBDOMAIN_FORMAT",
      });
    }

    // Check subdomain uniqueness
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });
    if (existingTenant) {
      throw new BadRequestException({ message: "ERR_SUBDOMAIN_EXISTS" });
    }

    // Use transaction to ensure tenant creation and seeding are atomic
    const savedTenant = await this.dataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // Handle logo upload
        let logoFilename: string = null;
        if (logoFile) {
          logoFilename = await this.uploadLogo(logoFile);

          // Parse config if it comes as a string (multipart/form-data quirk)
          if (typeof createTenantDto.config === "string") {
            try {
              createTenantDto.config = JSON.parse(createTenantDto.config);
            } catch (e: any) {
              this.#logger.error(
                `${logPrefix} : Error parsing config JSON: ${e.message}`,
              );
              createTenantDto.config = {};
            }
          }
        } else if (typeof createTenantDto.config === "string") {
          // Even if no logo, parse config if it's a string
          try {
            createTenantDto.config = JSON.parse(createTenantDto.config);
          } catch (e: any) {
            this.#logger.error(
              `${logPrefix} : Error parsing config JSON: ${e.message}`,
            );
            createTenantDto.config = {};
          }
        }

        // Remove logo from DTO if it exists as 'any' to avoid issues
        delete createTenantDto["logo"];

        const tenant = transactionalEntityManager.create(Tenant, {
          ...createTenantDto,
          logo: logoFilename,
        });
        const savedTenant = (await transactionalEntityManager.save(
          Tenant,
          tenant,
        )) as Tenant;

        // Seed initial data for the new tenant within the same transaction
        try {
          await this.tenantSeedingService.seedTenant(
            savedTenant.id,
            createTenantDto.email,
            createTenantDto.password,
            transactionalEntityManager,
          );
        } catch (error) {
          this.#logger.error(
            `${logPrefix} : Seeding failed for tenant ${savedTenant.id}: ${error}`,
          );
          throw error; // This will cause the transaction to rollback
        }

        return savedTenant;
      },
    );

    const response = new TenantResponseDto(
      this.buildTenantResponseData(savedTenant),
    );
    return new AppResponse(SuccessConstant.AddSuccessAction, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Update tenant details
   * @param id - Tenant ID
   * @param updateTenantDto - Tenant update data
   * @returns Promise of AppResponse with updated tenant
   */
  async update(
    id: string,
    updateTenantDto: UpdateTenantRequestDto,
    logoFile?: any,
  ): Promise<AppResponse<TenantResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.update.name);
    this.#logger.debug(`${logPrefix} : Updating tenant ID: ${id}`);

    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException({
        message: "ERR_MODULE_NOT_FOUND",
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    // Check subdomain uniqueness if updating
    if (
      updateTenantDto.subdomain &&
      updateTenantDto.subdomain !== tenant.subdomain
    ) {
      if (!ValidateSubdomain(updateTenantDto.subdomain)) {
        throw new BadRequestException({
          message: "ERR_INVALID_SUBDOMAIN_FORMAT",
        });
      }
      const existingTenant = await this.tenantRepository.findOne({
        where: { subdomain: updateTenantDto.subdomain },
      });
      if (existingTenant) {
        throw new BadRequestException({ message: "ERR_SUBDOMAIN_EXISTS" });
      }
    }

    // Parse config if it comes as a string (multipart/form-data quirk)
    if (typeof updateTenantDto.config === "string") {
      try {
        updateTenantDto.config = JSON.parse(updateTenantDto.config);
      } catch (e: any) {
        this.#logger.error(
          `${logPrefix} : Error parsing config JSON: ${e.message}`,
        );
        // Don't reset to empty object on error during update to avoid wiping existing config inadvertently,
        // but for safety we might need to if we want to set logoUrl.
        // Better to throw error or handle gracefully. Let's initialize if we need to set logo.
        if (logoFile) updateTenantDto.config = {};
      }
    }

    // Handle logo upload
    // Handle logo upload
    if (logoFile) {
      // Delete old logo if exists (check new column first)
      if (tenant.logo) {
        await this.removeOldLogo(tenant.logo);
      } else if (tenant.config && tenant.config.logoUrl) {
        // Fallback to legacy config for deletion if migrating
        await this.removeOldLogo(tenant.config.logoUrl);
      }

      const logoFilename = await this.uploadLogo(logoFile);
      tenant.logo = logoFilename;

      // Clean up config if it still had logoUrl?
      if (tenant.config && tenant.config.logoUrl) {
        delete tenant.config.logoUrl;
      }
    }

    Object.assign(tenant, updateTenantDto);

    const updatedTenant = await this.tenantRepository.save(tenant);

    const response = new TenantResponseDto(
      this.buildTenantResponseData(updatedTenant),
    );
    return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Deactivate a tenant
   * @param id - Tenant ID
   * @returns Promise of AppResponse with updated tenant
   */
  async deactivate(id: string): Promise<AppResponse<TenantResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.deactivate.name);
    this.#logger.debug(`${logPrefix} : Deactivating tenant ID: ${id}`);

    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException({
        message: "ERR_MODULE_NOT_FOUND",
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    if (tenant.status === TenantStatus.INACTIVE) {
      throw new BadRequestException({ message: "ERR_TENANT_ALREADY_INACTIVE" });
    }

    tenant.status = TenantStatus.INACTIVE;
    const updatedTenant = await this.tenantRepository.save(tenant);

    const response = new TenantResponseDto(updatedTenant);
    return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Activate a tenant
   * @param id - Tenant ID
   * @returns Promise of AppResponse with updated tenant
   */
  async activate(id: string): Promise<AppResponse<TenantResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.activate.name);
    this.#logger.debug(`${logPrefix} : Activating tenant ID: ${id}`);

    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException({
        message: "ERR_MODULE_NOT_FOUND",
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    if (tenant.status === TenantStatus.ACTIVE) {
      throw new BadRequestException({ message: "ERR_TENANT_ALREADY_ACTIVE" });
    }

    tenant.status = TenantStatus.ACTIVE;
    const updatedTenant = await this.tenantRepository.save(tenant);

    const response = new TenantResponseDto(updatedTenant);
    return new AppResponse(SuccessConstant.UpdateSuccessAction, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Find tenants list
   * @param searchRequest - List tenant request parameters
   * @returns Promise of AppResponse with tenant list
   */
  async findList(
    searchRequest: ListTenantRequestDto,
  ): Promise<AppResponse<CommonSearchResponseDto<TenantResponseDto>>> {
    const logPrefix = GenerateLogPrefix(this.findList.name);
    this.#logger.debug(`${logPrefix} : Finding tenants list`);

    const [tenants, total] =
      await this.tenantRepository.findTenants(searchRequest);

    const results = tenants.map(
      (t) => new TenantResponseDto(this.buildTenantResponseData(t)),
    );
    const response = new CommonSearchResponseDto(
      results,
      searchRequest.pageSize || 10,
      searchRequest.pageNumber || 1,
      total,
    );

    return new AppResponse(SuccessConstant.ListFetch, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
  }

  /**
   * Get tenant by ID
   * @param id - Tenant ID
   * @returns Promise of AppResponse with tenant data
   */
  async findById(id: string): Promise<AppResponse<TenantResponseDto>> {
    const logPrefix = GenerateLogPrefix(this.findById.name);
    this.#logger.debug(`${logPrefix} : Finding tenant by ID: ${id}`);

    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException({
        message: "ERR_MODULE_NOT_FOUND",
        module: MapToModuleName(ModuleNames.TENANT),
      });
    }

    const response = new TenantResponseDto(
      this.buildTenantResponseData(tenant),
    );
    return new AppResponse(SuccessConstant.DetailFetch, response, {
      module: MapToModuleName(ModuleNames.TENANT),
    });
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
    await this.s3Utility.uploadS3(
      file.buffer,
      this.s3Utility.privateBucketName,
      filePathWithFolder,
      file.mimetype,
    );
    return fileNameOnly;
  }

  /**
   * Remove old logo from S3
   * @param fileName - Filename to remove
   */
  private async removeOldLogo(fileName: string): Promise<void> {
    if (!fileName) return;
    const filePathWithFolder = `tenants/logos/${fileName}`;
    await this.s3Utility.deleteFileFromS3(
      filePathWithFolder,
      this.s3Utility.privateBucketName,
    );
  }

  /**
   * Build tenant response data with CloudFront URL for logo
   * @param tenant - Tenant entity
   * @returns Tenant data with full logo URL
   */
  private buildTenantResponseData(tenant: Tenant): any {
    const cloudFrontUrl = process.env.CLOUDFRONT_URL || "";
    const data = { ...tenant };

    if (data.logo) {
      if (!data.logo.startsWith("http")) {
        data.logo = `${cloudFrontUrl}tenants/logos/${data.logo}`;
      }
    }

    // Legacy cleanup: ensure we don't return partial path in config if it exists there
    // But we stopped writing to config.logoUrl, so it should be fine.

    return data;
  }

  // #endregion
}
