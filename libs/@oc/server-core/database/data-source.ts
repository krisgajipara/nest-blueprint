import { config } from "dotenv";
import { DataSource } from "typeorm";
import { AuditSubscriber } from "./subscribers/audit.subscriber";

// Load environment variables dynamically based on NODE_ENV
const envFile = `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`;

config({ path: envFile });

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    logging: process.env.DATABASE_LOG === "true",
    cache: process.env.DATABASE_CACHE === "true",
    ssl: {
        rejectUnauthorized: false // when ssl-mode = require in postgres db server
    },
    synchronize: false, // This MUST be false for migrations
    entities: [__dirname + "/entities/*.entity{.ts,.js}"],
    migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
    subscribers: [AuditSubscriber],
});
