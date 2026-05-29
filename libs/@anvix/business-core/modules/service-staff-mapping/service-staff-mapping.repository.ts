import { ServiceStaffMapping, TenantAwareRepository } from "@core-database";
import { UserStatus } from "@core-enums";
import { AsyncContextService } from "@core-generic-services";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class ServiceStaffMappingRepository extends TenantAwareRepository<ServiceStaffMapping> {
    constructor(
        @InjectRepository(ServiceStaffMapping)
        repository: Repository<ServiceStaffMapping>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }

    async findByServiceAndStaff(serviceId: string, staffId: string): Promise<ServiceStaffMapping | null> {
        return this.findOne({ where: { serviceId, staffId } as any });
    }

    async findByServiceId(serviceId: string, isActive?: boolean): Promise<ServiceStaffMapping[]> {
        const queryBuilder = this.createQueryBuilder("mapping");
        queryBuilder.leftJoinAndSelect("mapping.staff", "staff");
        queryBuilder.select([
            "mapping.id",
            "mapping.serviceId",
            "mapping.staffId",
            "mapping.skillLevel",
            "mapping.isActive",
            "mapping.createdAt",
            "mapping.updatedAt",
            "staff.id",
            "staff.firstName",
            "staff.lastName",
            "staff.email",
            "staff.status",
            "staff.experienceYears"
        ]);
        queryBuilder.andWhere("mapping.serviceId = :serviceId", { serviceId });

        if (isActive !== undefined) {
            queryBuilder.andWhere("mapping.isActive = :isActive", { isActive });
        }

        queryBuilder.orderBy("staff.firstName", "ASC");
        return queryBuilder.getMany();
    }

    async findAssignmentsByServiceIds(
        serviceIds: string[],
        assignmentIsActive?: boolean
    ): Promise<ServiceStaffMapping[]> {
        if (!serviceIds.length) {
            return [];
        }

        const queryBuilder = this.createQueryBuilder("mapping");
        queryBuilder.leftJoinAndSelect("mapping.staff", "staff");
        queryBuilder.select([
            "mapping.id",
            "mapping.serviceId",
            "mapping.staffId",
            "mapping.skillLevel",
            "mapping.isActive",
            "staff.id",
            "staff.firstName",
            "staff.lastName",
            "staff.experienceYears"
        ]);
        queryBuilder.andWhere("mapping.serviceId IN (:...serviceIds)", { serviceIds });

        if (assignmentIsActive !== undefined) {
            queryBuilder.andWhere("mapping.isActive = :assignmentIsActive", { assignmentIsActive });
        }

        queryBuilder.orderBy("staff.firstName", "ASC");
        return queryBuilder.getMany();
    }

    async findQualifiedStaffForService(serviceId: string): Promise<ServiceStaffMapping[]> {
        const queryBuilder = this.createQueryBuilder("mapping");
        queryBuilder.innerJoinAndSelect("mapping.staff", "staff");
        queryBuilder.select([
            "mapping.id",
            "mapping.staffId",
            "mapping.skillLevel",
            "staff.id",
            "staff.firstName",
            "staff.lastName"
        ]);
        queryBuilder.andWhere("mapping.serviceId = :serviceId", { serviceId });
        queryBuilder.andWhere("mapping.isActive = :mappingActive", { mappingActive: true });
        queryBuilder.andWhere("staff.status = :staffStatus", { staffStatus: UserStatus.ACTIVE });
        queryBuilder.orderBy("staff.firstName", "ASC");
        return queryBuilder.getMany();
    }
}
