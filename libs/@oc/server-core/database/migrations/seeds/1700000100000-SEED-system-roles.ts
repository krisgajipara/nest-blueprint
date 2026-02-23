import { MigrationInterface, QueryRunner } from "typeorm";

export class SEEDSystemRoles1700000100000 implements MigrationInterface {
    name = "SEEDSystemRoles1700000100000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert default roles with specific IDs based on type
        await queryRunner.query(`
            INSERT INTO "role" (
                "name",
                "description",
                "permissions",
                "system_role_type",
                "is_active",
                "created_at",
                "updated_at"
            ) VALUES
            (
                'Super Admin',
                'Super administrator with full access to all modules',
                '[
                    {"module": "User", "permissions": {"read": true, "write": true, "edit": true, "delete": true}},
                    {"module": "Role", "permissions": {"read": true, "write": true, "edit": true, "delete": true}}
                ]'::jsonb,
                'super_admin',
                true,
                NOW(),
                NOW()
            ),
            (
                'Admin',
                'Administrator with access to all modules except role management',
                '[
                    {"module": "User", "permissions": {"read": true, "write": true, "edit": true, "delete": true}}
                ]'::jsonb,
                'admin',
                true,
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default roles
        await queryRunner.query(`
            DELETE FROM "role"
            WHERE "name" IN ('Super Admin', 'Admin', 'Coach')
            AND "system_role_type" IN ('super_admin', 'admin', 'coach')
        `);
    }
}
