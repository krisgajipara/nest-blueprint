import { TenantAwareRepository, Token } from "@core-database";
import { RequestContextService } from "@core-shared-modules";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class TokenRepository extends TenantAwareRepository<Token> {
    constructor(
        @InjectRepository(Token)
        repository: Repository<Token>,
        @Inject() requestContextService: RequestContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }
}
