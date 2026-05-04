import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class AppController {
    constructor() {}

    @Get()
    getHello(): string {
        return "Working";
    }
}
