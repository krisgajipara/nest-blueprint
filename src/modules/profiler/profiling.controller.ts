import { AllowWithoutTenant } from "@core-custom-decorators";
import { ApiProfile, ProfilerService } from "@core-shared-modules";
import { Controller, Get, Header, Post } from "@nestjs/common";

import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@AllowWithoutTenant()
@Controller()
export class ProfilerController {
    constructor(private readonly profilerService: ProfilerService) {}

    @Get("profiler")
    @ApiOperation({ summary: "Get API profiler data" })
    @ApiResponse({ status: 200, description: "Profiler data retrieved successfully" })
    getProfilerData(): { summary: any; profiles: ApiProfile[] } {
        return {
            summary: this.profilerService.getSummary(),
            profiles: this.profilerService.getAllProfiles()
        };
    }

    @Get("profiler/summary")
    @ApiOperation({ summary: "Get profiler summary statistics" })
    @ApiResponse({ status: 200, description: "Profiler summary retrieved successfully" })
    getProfilerSummary(): any {
        return this.profilerService.getSummary();
    }

    @Get("profiler/slow")
    @ApiOperation({ summary: "Get slow endpoints (average >500ms)" })
    @ApiResponse({ status: 200, description: "Slow endpoints retrieved successfully" })
    getSlowEndpoints(): ApiProfile[] {
        return this.profilerService.getSlowEndpoints();
    }

    @Get("profiler/errors")
    @ApiOperation({ summary: "Get endpoints with high error rates (>5%)" })
    @ApiResponse({ status: 200, description: "High error rate endpoints retrieved successfully" })
    getHighErrorRateEndpoints(): ApiProfile[] {
        return this.profilerService.getHighErrorRateEndpoints();
    }

    @Post("profiler/clear")
    @ApiOperation({ summary: "Clear all profiler data" })
    @ApiResponse({ status: 200, description: "Profiler data cleared successfully" })
    clearProfilerData(): { message: string } {
        this.profilerService.clearAllProfiles();
        return { message: "Profiler data cleared successfully" };
    }

    @Get("profiler-ui")
    @Header("Content-Type", "text/html")
    @ApiOperation({ summary: "Serve the profiler dashboard UI" })
    @ApiResponse({ status: 200, description: "Profiler dashboard retrieved successfully" })
    getProfilerUI() {
        const fs = require("fs");
        const path = require("path");
        const htmlPath = path.join(__dirname, "..", "libs/@anvix/server-core/assets", "profiler-dashboard.html");

        // If file doesn't exist in dist (common in dev), check src
        const finalPath = fs.existsSync(htmlPath)
            ? htmlPath
            : path.join(process.cwd(), "libs/@anvix/server-core/assets", "profiler-dashboard.html");

        if (!fs.existsSync(finalPath)) {
            return "Dashboard source not found. Please ensure src/profiler-dashboard.html exists.";
        }

        return fs.readFileSync(finalPath, "utf8");
    }

    @Get("profiler-ui/script.js")
    @Header("Content-Type", "application/javascript")
    @ApiOperation({ summary: "Serve the profiler dashboard JS" })
    @ApiResponse({ status: 200, description: "Profiler dashboard script retrieved successfully" })
    getProfilerScript() {
        const fs = require("fs");
        const path = require("path");
        const jsPath = path.join(__dirname, "..", "libs/@anvix/server-core/assets", "profiler-dashboard.js");
        const finalPath = fs.existsSync(jsPath)
            ? jsPath
            : path.join(process.cwd(), "libs/@anvix/server-core/assets", "profiler-dashboard.js");

        if (!fs.existsSync(finalPath)) {
            return "// Dashboard script not found.";
        }

        return fs.readFileSync(finalPath, "utf8");
    }
}
