import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceCatalog1700000000001 implements MigrationInterface {
    name = "ServiceCatalog1700000000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."service_category_gender_enum" AS ENUM('MALE', 'FEMALE', 'UNISEX')`
        );
        await queryRunner.query(
            `CREATE TABLE "service_category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "name" character varying(100) NOT NULL,
                "gender" "public"."service_category_gender_enum" NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_service_category_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_SERVICE_CATEGORY_TENANT_NAME" UNIQUE ("tenant_id", "name", "deleted_at")
            )`
        );
        await queryRunner.query(`CREATE INDEX "IDX_service_category_tenant_id" ON "service_category" ("tenant_id")`);

        await queryRunner.query(
            `CREATE TABLE "service" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "category_id" uuid NOT NULL,
                "name" character varying(150) NOT NULL,
                "description" text,
                "price" numeric(12,2) NOT NULL,
                "duration_min" integer NOT NULL,
                "image" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_service_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_SERVICE_TENANT_CATEGORY_NAME" UNIQUE ("tenant_id", "category_id", "name", "deleted_at"),
                CONSTRAINT "FK_service_category" FOREIGN KEY ("category_id") REFERENCES "service_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )`
        );
        await queryRunner.query(`CREATE INDEX "IDX_service_tenant_id" ON "service" ("tenant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_service_category_id" ON "service" ("category_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_service_is_active" ON "service" ("is_active")`);

        await queryRunner.query(
            `CREATE TYPE "public"."service_staff_mapping_skill_level_enum" AS ENUM('JUNIOR', 'SENIOR', 'EXPERT')`
        );
        await queryRunner.query(
            `CREATE TABLE "service_staff_mapping" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "service_id" uuid NOT NULL,
                "staff_id" uuid NOT NULL,
                "skill_level" "public"."service_staff_mapping_skill_level_enum" NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_service_staff_mapping_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_SERVICE_STAFF_MAPPING_TENANT_SERVICE_STAFF" UNIQUE ("tenant_id", "service_id", "staff_id", "deleted_at"),
                CONSTRAINT "FK_service_staff_mapping_service" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_service_staff_mapping_staff" FOREIGN KEY ("staff_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_staff_mapping_tenant_id" ON "service_staff_mapping" ("tenant_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_staff_mapping_service_id" ON "service_staff_mapping" ("service_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_staff_mapping_staff_id" ON "service_staff_mapping" ("staff_id")`
        );

        await queryRunner.query(`
            UPDATE "role"
            SET "permissions" = REPLACE("permissions"::text, '"module":"SalonService"', '"module":"Service"')::jsonb
            WHERE "permissions"::text LIKE '%SalonService%'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_service_staff_mapping_staff_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_staff_mapping_service_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_staff_mapping_tenant_id"`);
        await queryRunner.query(`DROP TABLE "service_staff_mapping"`);
        await queryRunner.query(`DROP TYPE "public"."service_staff_mapping_skill_level_enum"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_service_is_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_category_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_tenant_id"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_category_tenant_id"`);
        await queryRunner.query(`DROP TABLE "service_category"`);
        await queryRunner.query(`DROP TYPE "public"."service_category_gender_enum"`);
    }
}
