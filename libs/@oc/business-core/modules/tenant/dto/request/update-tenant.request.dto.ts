import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateOptional, ValidateType, ValidateMaxLength, ValidateEnumType } from "@core-custom-validators";
import { FieldTypeEnum, TenantStatus } from "@core-enums";
import { TenantEntityConstant } from "@core-constants";
import { TenantConfigDto } from "../tenant-config.dto";

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
    config?: TenantConfigDto;

    @ApiPropertyOptional({ description: "Tenant status", enum: TenantStatus })
    @ValidateOptional()
    @ValidateEnumType(TenantStatus, { constraints: { field: "status" } })
    status?: TenantStatus;

    @ApiPropertyOptional({ type: "string", format: "binary", description: "Tenant logo file" })
    @ValidateOptional()
    logo?: any;
}
