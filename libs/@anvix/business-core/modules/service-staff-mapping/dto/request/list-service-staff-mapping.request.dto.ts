import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class ListServiceStaffMappingRequestDto {
    @ApiPropertyOptional({ description: "Filter by assignment active status" })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
