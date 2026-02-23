import { Injectable } from "@nestjs/common";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";

@Injectable()
@ValidatorConstraint()
export class ValidateOptionalConstraint implements ValidatorConstraintInterface {
    validate(): boolean {
        // Always return true - this is a marker for optional fields
        // The actual validation will be handled by other validators
        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        const { message } = args.constraints[0] as IDynamicValidationOptions;
        return message || "Field is optional";
    }
}

export function ValidateOptional(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [validationOptions || {}],
            options: options,
            validator: ValidateOptionalConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateOptional({ constraints: { field: "Phone number" } })
  @ValidateMaxLength(UserEntityConstant.PhoneNumberMaxLength, { constraints: { field: "Phone number" } })
  @ValidateType({ constraints: { field: "phoneNumber", type: FieldTypeEnum.String } })
  phoneNumber?: string;

===============================================: EXAMPLE :======================================================
*/
