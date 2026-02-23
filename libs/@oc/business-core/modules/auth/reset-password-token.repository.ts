import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ResetPasswordToken } from "@core-database";

@Injectable()
export class ResetPasswordTokenRepository extends Repository<ResetPasswordToken> {
    constructor(
        @InjectRepository(ResetPasswordToken)
        repository: Repository<ResetPasswordToken>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
