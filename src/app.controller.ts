import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

@ApiTags("Health")
@Controller()
export class AppController {
    @SkipThrottle()
    @Get()
    getHello(): string {
        return "Working";
    }
}


// test comment