import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "@core-database";

@Injectable()
export class OtpRepository extends Repository<Otp> {
    constructor(
        @InjectRepository(Otp)
        repository: Repository<Otp>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
