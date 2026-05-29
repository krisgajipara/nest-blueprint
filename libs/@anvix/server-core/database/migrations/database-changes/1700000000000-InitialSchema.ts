import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Initial database schema (first and only schema migration).
 * Runs before seeders. Fresh local DB: drop/recreate schema, then npm run migration:run.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
    name = "InitialSchema1700000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."role_system_role_type_enum" AS ENUM('super_admin', 'admin', 'user')`
        );
        await queryRunner.query(
            `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid, "name" character varying(100) NOT NULL, "description" character varying(500), "permissions" jsonb NOT NULL DEFAULT '[]', "system_role_type" "public"."role_system_role_type_enum", "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_85e2fec3e4e4f4ab521c4a1a46" ON "role" ("tenant_id") `);

        await queryRunner.query(`CREATE TYPE "public"."user_user_type_enum" AS ENUM('1', '2', '3', '4', '5')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION')`);
        await queryRunner.query(
            `CREATE TABLE "user" ("created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(250), "salt" character varying(50), "phone_number" character varying(15), "date_of_birth" date, "experience_years" integer, "user_type" "public"."user_user_type_enum" NOT NULL DEFAULT '4', "status" "public"."user_status_enum" NOT NULL DEFAULT 'ACTIVE', "role_id" uuid, CONSTRAINT "UK_USER_EMAIL_USER_TYPE" UNIQUE ("email", "user_type", "deleted_at"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_ae07d48a61ca20ab3586d397a7" ON "user" ("tenant_id") `);

        await queryRunner.query(
            `CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid, "user_id" uuid NOT NULL, "access_token" text NOT NULL, "refresh_token" text NOT NULL, "remember_me" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_920820765e05f4d81fba4979b5" ON "token" ("tenant_id") `);

        await queryRunner.query(`CREATE TYPE "public"."otp_otp_type_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(
            `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid, "otp_code" character varying(6) NOT NULL, "otp_type" "public"."otp_otp_type_enum" NOT NULL, "expire_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_eb86c31f9a1a09008edfa86edb" ON "otp" ("tenant_id") `);

        await queryRunner.query(
            `CREATE TABLE "reset_password_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid, "reset_token" character varying(255) NOT NULL, "user_id" uuid NOT NULL, "expire_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "platform" character varying(50) NOT NULL, CONSTRAINT "PK_c6f6eb8f5c88ac0233eceb8d385" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_d706fc45deb744ab205f851983" ON "reset_password_token" ("tenant_id") `);

        await queryRunner.query(`CREATE TYPE "public"."tenant_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(
            `CREATE TABLE "tenant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "subdomain" character varying(255) NOT NULL, "config" jsonb DEFAULT '{}', "logo" character varying(500), "status" "public"."tenant_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "UQ_a1da63250e49e1cfb2cf9bacfaf" UNIQUE ("subdomain"), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`CREATE INDEX "IDX_a1da63250e49e1cfb2cf9bacfa" ON "tenant" ("subdomain") `);

        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "token" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "otp" ADD CONSTRAINT "FK_258d028d322ea3b856bf9f12f25" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "reset_password_token" ADD CONSTRAINT "FK_4ec784f3b60e7ea2cafad470cc7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`
        );

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

        await queryRunner.query(
            `CREATE TABLE "skill" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "name" character varying(100) NOT NULL,
                "description" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_skill_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_SKILL_TENANT_NAME" UNIQUE ("tenant_id", "name", "deleted_at")
            )`
        );
        await queryRunner.query(`CREATE INDEX "IDX_skill_tenant_id" ON "skill" ("tenant_id")`);

        await queryRunner.query(
            `CREATE TABLE "stylist_skill_mapping" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "stylist_id" uuid NOT NULL,
                "skill_id" uuid NOT NULL,
                CONSTRAINT "PK_stylist_skill_mapping_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_STYLIST_SKILL_MAPPING_TENANT_STYLIST_SKILL" UNIQUE ("tenant_id", "stylist_id", "skill_id", "deleted_at"),
                CONSTRAINT "FK_stylist_skill_mapping_stylist" FOREIGN KEY ("stylist_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_stylist_skill_mapping_skill" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_stylist_skill_mapping_tenant_id" ON "stylist_skill_mapping" ("tenant_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_stylist_skill_mapping_stylist_id" ON "stylist_skill_mapping" ("stylist_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_stylist_skill_mapping_skill_id" ON "stylist_skill_mapping" ("skill_id")`
        );

        await queryRunner.query(
            `CREATE TABLE "service_skill_mapping" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" uuid,
                "updated_by" uuid,
                "deleted_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "tenant_id" uuid,
                "service_id" uuid NOT NULL,
                "skill_id" uuid NOT NULL,
                CONSTRAINT "PK_service_skill_mapping_id" PRIMARY KEY ("id"),
                CONSTRAINT "UK_SERVICE_SKILL_MAPPING_TENANT_SERVICE_SKILL" UNIQUE ("tenant_id", "service_id", "skill_id", "deleted_at"),
                CONSTRAINT "FK_service_skill_mapping_service" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_service_skill_mapping_skill" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_skill_mapping_tenant_id" ON "service_skill_mapping" ("tenant_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_skill_mapping_service_id" ON "service_skill_mapping" ("service_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_service_skill_mapping_skill_id" ON "service_skill_mapping" ("skill_id")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_service_skill_mapping_skill_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_skill_mapping_service_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_service_skill_mapping_tenant_id"`);
        await queryRunner.query(`DROP TABLE "service_skill_mapping"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_stylist_skill_mapping_skill_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_stylist_skill_mapping_stylist_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_stylist_skill_mapping_tenant_id"`);
        await queryRunner.query(`DROP TABLE "stylist_skill_mapping"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_skill_tenant_id"`);
        await queryRunner.query(`DROP TABLE "skill"`);

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

        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "reset_password_token" DROP CONSTRAINT "FK_4ec784f3b60e7ea2cafad470cc7"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "FK_258d028d322ea3b856bf9f12f25"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1da63250e49e1cfb2cf9bacfa"`);
        await queryRunner.query(`DROP TABLE "tenant"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d706fc45deb744ab205f851983"`);
        await queryRunner.query(`DROP TABLE "reset_password_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb86c31f9a1a09008edfa86edb"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TYPE "public"."otp_otp_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_920820765e05f4d81fba4979b5"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae07d48a61ca20ab3586d397a7"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_user_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85e2fec3e4e4f4ab521c4a1a46"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_system_role_type_enum"`);
    }
}
