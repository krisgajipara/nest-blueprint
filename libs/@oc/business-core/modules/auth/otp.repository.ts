import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "@core-database";
import { TenantAwareRepository } from "libs/@oc/server-core/database/repositories/tenant-aware.repository";

@Injectable()
export class OtpRepository extends TenantAwareRepository<Otp> {
    constructor(
        @InjectRepository(Otp)
        repository: Repository<Otp>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
