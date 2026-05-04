import { ValidateNotEmpty, ValidateOptional, ValidateType } from "@core-custom-validators";
import { FieldTypeEnum } from "../enums/field-type.enum";

/**
 * Decorator for required string fields with validation
 * @param displayName - Display name for error messages
 * @param fieldName - Field name for technical validation (defaults to property name)
 * @returns Combined decorators
 */
export function RequiredStringField(displayName: string, fieldName?: string) {
    return function (target: any, propertyName: string) {
        ValidateNotEmpty({ constraints: { field: displayName } })(target, propertyName);
        ValidateType({ constraints: { field: fieldName || propertyName, type: FieldTypeEnum.String } })(
            target,
            propertyName
        );
    };
}

/**
 * Decorator for optional string fields with validation
 * @param displayName - Display name for error messages
 * @param fieldName - Field name for technical validation (defaults to property name)
 * @returns Combined decorators
 */
export function OptionalStringField(displayName: string, fieldName?: string) {
    return function (target: any, propertyName: string) {
        ValidateOptional({ constraints: { field: displayName } })(target, propertyName);
        ValidateType({ constraints: { field: fieldName || propertyName, type: FieldTypeEnum.String } })(
            target,
            propertyName
        );
    };
}
