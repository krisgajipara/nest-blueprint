import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "@core-database";

@Injectable()
export class TokenRepository extends Repository<Token> {
    constructor(
        @InjectRepository(Token)
        repository: Repository<Token>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
