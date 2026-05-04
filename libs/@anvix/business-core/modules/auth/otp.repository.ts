import { Otp, TenantAwareRepository } from "@core-database";
import { RequestContextService } from "@core-shared-modules";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class OtpRepository extends TenantAwareRepository<Otp> {
    constructor(
        @InjectRepository(Otp)
        repository: Repository<Otp>,
        @Inject() requestContextService: RequestContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }
}
