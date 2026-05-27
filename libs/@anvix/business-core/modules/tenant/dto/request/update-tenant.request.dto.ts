import { TenantEntityConstant } from "@core-constants";
import { ValidateEnumType, ValidateMaxLength, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum, TenantStatus } from "@core-enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { TenantConfigDto } from "../tenant-config.dto";
import { Transform } from "class-transformer";

/**
 * DTO for updating tenant details
 */
export class UpdateTenantRequestDto {
    @ApiPropertyOptional({ description: "Tenant name", example: "Acme Corp" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(TenantEntityConstant.NameMaxLength, { constraints: { field: "name" } })
    name?: string;

    @ApiPropertyOptional({ description: "Subdomain for routing", example: "acme" })
    @ValidateOptional()
    @ValidateType({ constraints: { field: "subdomain", type: FieldTypeEnum.String } })
    @ValidateMaxLength(TenantEntityConstant.SubdomainMaxLength, { constraints: { field: "subdomain" } })
    subdomain?: string;

    @ApiPropertyOptional({ description: "Tenant configuration", type: TenantConfigDto })
    @ValidateOptional()
    @Transform(({ value }) => JSON.parse(value))
    config?: TenantConfigDto;

    @ApiPropertyOptional({ description: "Tenant status", enum: TenantStatus })
    @ValidateOptional()
    @ValidateEnumType(TenantStatus, { constraints: { field: "status" } })
    status?: TenantStatus;
}
