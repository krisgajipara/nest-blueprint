import { AppProfilerModule } from "@core-shared-modules";
import { Global, Module } from "@nestjs/common";
import { ProfilerController } from "./profiling.controller";

@Global()
@Module({
    imports: [AppProfilerModule],
    controllers: [ProfilerController]
})
export class ProfilerModule {}
