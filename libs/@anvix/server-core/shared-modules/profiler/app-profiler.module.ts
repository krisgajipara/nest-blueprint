import { Global, Module } from "@nestjs/common";
import { ProfilerService } from "./app-profiler.service";

@Global()
@Module({
    providers: [ProfilerService],
    exports: [ProfilerService]
})
export class AppProfilerModule {}
