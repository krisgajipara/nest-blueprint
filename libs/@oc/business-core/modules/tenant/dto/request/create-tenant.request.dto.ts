import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    ValidateOptional,
    ValidateNotEmpty,
    ValidateType,
    ValidateMaxLength,
    ValidateEmail,
    ValidateMinLength
} from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";
import { TenantEntityConstant, UserEntityConstant } from "@core-constants";
import { TenantConfigDto } from "../tenant-config.dto";

export class CreateTenantRequestDto {
    @ApiProperty({ description: "Tenant name", example: "Acme Corp" })
    @ValidateNotEmpty({ constraints: { field: "name" } })
    @ValidateType({ constraints: { field: "name", type: FieldTypeEnum.String } })
    @ValidateMaxLength(TenantEntityConstant.NameMaxLength, { constraints: { field: "name" } })
    name: string;

    @ApiProperty({ description: "Subdomain for routing", example: "acme" })
    @ValidateNotEmpty({ constraints: { field: "subdomain" } })
    @ValidateType({ constraints: { field: "subdomain", type: FieldTypeEnum.String } })
    @ValidateMaxLength(TenantEntityConstant.SubdomainMaxLength, { constraints: { field: "subdomain" } })
    subdomain: string;

    @ApiProperty({ description: "Email address for tenant admin user", example: "admin@acme.com" })
    @ValidateNotEmpty({ constraints: { field: "Email" } })
    @ValidateMaxLength(UserEntityConstant.EmailMaxLength, { constraints: { field: "Email" } })
    @ValidateEmail({ constraints: { field: "Email" } })
    email: string;

    @ApiProperty({ description: "Password for tenant admin user", example: "SecurePass123!", minLength: 8 })
    @ValidateNotEmpty({ constraints: { field: "Password" } })
    @ValidateMinLength(8, { constraints: { field: "Password" } })
    @ValidateMaxLength(UserEntityConstant.PasswordMaxLength, { constraints: { field: "Password" } })
    @ValidateType({ constraints: { field: "password", type: FieldTypeEnum.String } })
    password: string;

    @ApiPropertyOptional({ description: "Tenant configuration", type: TenantConfigDto })
    @ValidateOptional()
    config?: TenantConfigDto;

    @ApiPropertyOptional({ type: "string", format: "binary", description: "Tenant logo file" })
    @ValidateOptional()
    logo?: any;
}
