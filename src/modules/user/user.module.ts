import {
    UserRepository,
    UserService
} from "@business-core-modules";
import {
    User
} from "@core-database";
import { AppCacheModule } from "@core-shared-modules";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";

/**
 * User module configuration
 * Registers the user controller, service, repository, and database entities
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            User
        ]),
        AppCacheModule
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserRepository,
        UserRepository
    ],
    exports: [UserService]
})
export class UserModule { }
