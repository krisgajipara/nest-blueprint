import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsUUID } from "class-validator";
import { ValidateNotEmpty, ValidateMaxLength, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "@core-enums";

/**
 * DTO for checking user permissions
 */
export class CheckPermissionRequestDto {
    @ApiProperty({
        description: "User ID to check permissions for",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    @IsUUID()
    @ValidateNotEmpty({ constraints: { field: "user id" } })
    userId: string;

    @ApiProperty({
        description: "HTTP method to check",
        example: "GET",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    })
    @ValidateType({ constraints: { field: "http method", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "http method" } })
    @IsIn(["GET", "POST", "PUT", "DELETE", "PATCH"])
    method: string;

    @ApiProperty({
        description: "API resource/endpoint path to check",
        example: "/users",
        maxLength: 255
    })
    @ValidateType({ constraints: { field: "resource path", type: FieldTypeEnum.String } })
    @ValidateNotEmpty({ constraints: { field: "resource path" } })
    @ValidateMaxLength(255, { constraints: { field: "resource path" } })
    resource: string;
}
