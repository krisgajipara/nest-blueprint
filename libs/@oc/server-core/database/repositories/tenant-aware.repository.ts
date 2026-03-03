import {
    Brackets,
    DeleteResult,
    FindOptionsWhere,
    InsertResult,
    Repository,
    SelectQueryBuilder,
    UpdateResult,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { UpsertOptions } from "typeorm/repository/UpsertOptions";

import { RequestContextService } from "@core-utilities";
import { Logger } from "@nestjs/common";

export class TenantAwareRepository<T extends any> extends Repository<T> {
  constructor(
    target: any,
    manager: any,
    queryRunner: any,
    public readonly context: RequestContextService,
  ) {
    super(target, manager, queryRunner);
  }

  readonly #logger = new Logger(TenantAwareRepository.name);

  protected applyFilters(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    const tenantId = this.context.getTenantId();
    const hasTenantId = this.metadata.columns.some(
      (col) => col.propertyName === "tenantId",
    );
    const hasDeletedAt = this.metadata.columns.some(
      (col) => col.propertyName === "deletedAt",
    );

    // 1. Apply to root alias (Expense)
    // These remain strict because the root record MUST match the tenant
    if (tenantId && hasTenantId) {
      qb.andWhere(`${qb.alias}.tenant_id = :tenantId`, { tenantId });
    }
    if (hasDeletedAt) {
      qb.andWhere(`${qb.alias}.deleted_at IS NULL`);
    }

    // 2. Apply to joined aliases (Staff, etc.)
    qb.expressionMap.aliases.forEach((alias) => {
      if (alias.name === qb.alias) return;

      try {
        const metadata = this.manager.connection.getMetadata(alias.target);
        const hasTenantId = metadata.columns.some(
          (col) => col.propertyName === "tenantId",
        );

        if (hasTenantId) {
          // We wrap joined filters in Brackets to allow for NULLs (empty joins)
          qb.andWhere(
            new Brackets((subQb) => {
              // Safety check: if the joined ID is NULL, it means the LEFT JOIN
              // didn't find a match. We allow this to keep the parent record visible.
              subQb.where(`${alias.name}.id IS NULL`);

              if (hasTenantId && tenantId) {
                subQb.orWhere(`${alias.name}.tenant_id = :tenantId`, {
                  tenantId,
                });
              }
            }),
          );
        }
      } catch (e) {
        this.#logger.error(`Filter Error for alias  ${alias.name}:`, e);
      }
    });

    return qb;
  }

  override createQueryBuilder(
    alias: string,
    queryRunner?: any,
  ): SelectQueryBuilder<T> {
    const qb = super.createQueryBuilder(alias, queryRunner);

    // We wrap the execution methods to ensure filters are applied AT THE END
    const originalGetMany = qb.getMany.bind(qb);
    const originalGetOne = qb.getOne.bind(qb);
    const originalGetManyAndCount = qb.getManyAndCount.bind(qb);
    const originalGetRawMany = qb.getRawMany.bind(qb);
    const originalGetRawOne = qb.getRawOne.bind(qb);
    const originalGetRawAndEntities = qb.getRawAndEntities.bind(qb);
    const originalGetCount = qb.getCount.bind(qb);

    qb.getMany = async () => originalGetMany(this.applyFilters(qb));
    qb.getOne = async () => originalGetOne(this.applyFilters(qb));
    qb.getManyAndCount = async () =>
      originalGetManyAndCount(this.applyFilters(qb));
    qb.getRawMany = async () => originalGetRawMany(this.applyFilters(qb));
    qb.getRawOne = async () => originalGetRawOne(this.applyFilters(qb));
    qb.getRawAndEntities = async () =>
      originalGetRawAndEntities(this.applyFilters(qb));
    qb.getCount = async () => originalGetCount(this.applyFilters(qb));

    return qb;
  }

  // Override common finding methods to ensure they use createQueryBuilder (and thus our filters)
  override async find(options?: any): Promise<T[]> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    if (options) {
      (qb as any).setFindOptions(options);
    }
    return qb.getMany();
  }

  override async findOne(options: any): Promise<T | null> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    if (options) {
      (qb as any).setFindOptions(options);
    }
    return qb.getOne();
  }

  override async findAndCount(options?: any): Promise<[T[], number]> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    if (options) {
      (qb as any).setFindOptions(options);
    }
    return qb.getManyAndCount();
  }

  override async count(options?: any): Promise<number> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    if (options) {
      (qb as any).setFindOptions(options);
    }
    return qb.getCount();
  }

  async findById(id: string | number): Promise<T | null> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    qb.where(`${qb.alias}.id = :id`, { id });
    return qb.getOne();
  }

  // ========== Enhanced Finder Overrides ==========

  override async findBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T[]> {
    return this.find({ where });
  }

  override async findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T | null> {
    return this.findOne({ where });
  }

  override async findOneOrFail(options: any): Promise<T> {
    const alias = this.metadata.name;
    const qb = this.createQueryBuilder(alias);
    if (options) {
      (qb as any).setFindOptions(options);
    }
    const result = await qb.getOne();
    if (!result) {
      throw new Error(
        `Could not find any entity of type "${this.metadata.name}" matching: ${JSON.stringify(options)}`,
      );
    }
    return result;
  }

  override async findOneByOrFail(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T> {
    return this.findOneOrFail({ where });
  }

  override async countBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<number> {
    return this.count({ where });
  }

  override async exists(options?: any): Promise<boolean> {
    const count = await this.count(options);
    return count > 0;
  }

  override async existsBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<boolean> {
    return this.exists({ where });
  }

  // ========== Mutation Overrides with Tenant Injection ==========

  override async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const tenantId = this.context.getTenantId();
    let enhancedCriteria = criteria;

    if (tenantId) {
      if (
        typeof criteria === "string" ||
        typeof criteria === "number" ||
        Array.isArray(criteria)
      ) {
        enhancedCriteria = { id: criteria, tenantId } as any;
      } else {
        enhancedCriteria = { ...criteria, tenantId } as any;
      }
    }

    return super.update(enhancedCriteria, partialEntity);
  }

  override async delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    const tenantId = this.context.getTenantId();
    let enhancedCriteria = criteria;

    if (tenantId) {
      if (
        typeof criteria === "string" ||
        typeof criteria === "number" ||
        Array.isArray(criteria)
      ) {
        enhancedCriteria = { id: criteria, tenantId } as any;
      } else {
        enhancedCriteria = { ...criteria, tenantId } as any;
      }
    }

    return super.delete(enhancedCriteria);
  }

  override async softDelete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<T>,
  ): Promise<UpdateResult> {
    const tenantId = this.context.getTenantId();
    let enhancedCriteria = criteria;

    if (tenantId) {
      if (
        typeof criteria === "string" ||
        typeof criteria === "number" ||
        Array.isArray(criteria)
      ) {
        enhancedCriteria = { id: criteria, tenantId } as any;
      } else {
        enhancedCriteria = { ...criteria, tenantId } as any;
      }
    }

    return super.softDelete(enhancedCriteria);
  }

  override async insert(
    entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ): Promise<InsertResult> {
    const tenantId = this.context.getTenantId();
    if (tenantId) {
      if (Array.isArray(entity)) {
        entity.forEach((e: any) => {
          if (!e.tenantId) e.tenantId = tenantId;
        });
      } else {
        const e = entity as any;
        if (!e.tenantId) e.tenantId = tenantId;
      }
    }
    return super.insert(entity);
  }

  override async upsert(
    entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
    conflictPathsOrOptions: string[] | UpsertOptions<T>,
  ): Promise<InsertResult> {
    const tenantId = this.context.getTenantId();
    if (tenantId) {
      if (Array.isArray(entityOrEntities)) {
        entityOrEntities.forEach((e: any) => {
          if (!e.tenantId) e.tenantId = tenantId;
        });
      } else {
        const e = entityOrEntities as any;
        if (!e.tenantId) e.tenantId = tenantId;
      }
    }
    return super.upsert(entityOrEntities, conflictPathsOrOptions);
  }

  // Note: save() and remove() usually handle entities.
  // TypeORM listeners or manual assignment in services should handle tenantId.
  // However, we can add a check here for extra safety.

  override async save(entities: any, options?: any): Promise<any> {
    const tenantId = this.context.getTenantId();
    if (tenantId) {
      if (Array.isArray(entities)) {
        entities.forEach((e) => {
          if (e.tenantId && e.tenantId !== tenantId) {
            throw new Error(
              `Tenant mismatch: Entity belongs to tenant ${e.tenantId} but current session is ${tenantId}`,
            );
          }
          e.tenantId = tenantId;
        });
      } else {
        if (entities.tenantId && entities.tenantId !== tenantId) {
          throw new Error(
            `Tenant mismatch: Entity belongs to tenant ${entities.tenantId} but current session is ${tenantId}`,
          );
        }
        entities.tenantId = tenantId;
      }
    }
    return super.save(entities, options);
  }

  /**
   * Admin/system method to bypass tenant filtering
   * Use with caution - only for cross-tenant operations
   */
  createQueryBuilderUnfiltered(
    alias: string,
    queryRunner?: any,
  ): SelectQueryBuilder<T> {
    return super.createQueryBuilder(alias, queryRunner);
  }
}
