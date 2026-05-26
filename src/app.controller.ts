import { AllowWithoutTenant } from "@core-custom-decorators";
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class AppController {
    constructor() {}

    @Get()
    @AllowWithoutTenant()
    getHello(): string {
        return "Working";
    }
}
