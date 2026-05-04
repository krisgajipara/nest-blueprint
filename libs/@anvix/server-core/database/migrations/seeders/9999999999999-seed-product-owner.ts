import { UserTypeEnum } from "@core-enums";
import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedProductOwner9999999999999 implements MigrationInterface {
    name = "SeedProductOwner9999999999999";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "user" (
                "first_name",
                "last_name",
                "email",
                "password",
                "salt",
                "user_type",
                "status",
                "created_at",
                "updated_at"
            ) VALUES (
                'Product',
                'Owner',
                'product.owner@yopmail.com',
                '$2b$10$1ghtT/.Nbem6NZk5ZQcFc.2H27XK2wXFaMQhfZPWRU.UIvY5PII9O',
                '$2b$10$1ghtT/.Nbem6NZk5ZQcFc.',
                '${UserTypeEnum.PRODUCT_OWNER}',
                'ACTIVE',
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add rollback SQL here if needed
        await queryRunner.query(`
            DELETE FROM "user"
            WHERE "email" = 'product.owner@yopmail.com' AND "user_type" = '${UserTypeEnum.PRODUCT_OWNER}'
        `);
    }
}
