import { Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "typeorm";
import {
    Role,
    User
} from "@core-database";
import { UserTypeEnum, UserStatus, SystemRoleType } from "@core-enums";

@Injectable()
export class TenantSeedingService {
    private readonly logger = new Logger(TenantSeedingService.name);

    constructor(private readonly entityManager: EntityManager) {}

    /**
     * Seeds initial data for a new tenant
     * @param tenantId - The UUID of the new tenant
     * @param adminEmail - Email for the super admin user
     * @param adminPassword - Password for the super admin user
     * @param entityManager - Optional EntityManager to use for transaction (for nested transactions)
     */
    async seedTenant(tenantId: string, adminEmail: string, adminPassword: string, entityManager?: EntityManager) {
        this.logger.log(`Seeding data for tenant: ${tenantId}`);

        const managerToUse = entityManager || this.entityManager;

        await managerToUse.transaction(async (manager) => {
            // Seed Roles
            const roles = await this.seedRoles(manager, tenantId);

            // Seed Super Admin User
            if (roles.superAdminRole) {
                await this.seedSuperAdmin(manager, tenantId, roles.superAdminRole, adminEmail, adminPassword);
            }
        });

        this.logger.log(`Seeding completed successfully for tenant: ${tenantId}`);
    }

    private async seedRoles(manager: EntityManager, tenantId: string) {
        const commonPermissions = {
            read: true,
            write: true,
            edit: true,
            delete: true
        };

        const allModules = [
            "User",
            "Auth",
            "Role",
        ];

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
}
