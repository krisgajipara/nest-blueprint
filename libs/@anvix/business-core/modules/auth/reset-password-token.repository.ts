import { ResetPasswordToken, TenantAwareRepository } from "@core-database";
import { RequestContextService } from "@core-shared-modules";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class ResetPasswordTokenRepository extends TenantAwareRepository<ResetPasswordToken> {
    constructor(
        @InjectRepository(ResetPasswordToken)
        repository: Repository<ResetPasswordToken>,
        @Inject() requestContextService: RequestContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }
}
