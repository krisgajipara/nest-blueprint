import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import {
    isNotEmpty,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
@ValidatorConstraint({ async: false })
export class ValidateMinLengthConstraint implements ValidatorConstraintInterface {
    constructor() {}
    validate(value: any, args: ValidationArguments) {
        const length = args.constraints[1] as number;
        if (typeof value !== "string" || !isNotEmpty(value)) {
            return true;
        }

        if (value.length < length) {
            return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        constraints.min = args.constraints[1];

        return `${Translation.Translator(
            language,
            TranslationFile.Error,
            message || "ERR_MIN_LENGTH",
            constraints
        )}&&&${args.property}`;
    }
}

export function ValidateMinLength(
    length: number,
    validationOptions: IDynamicValidationOptions,
    options?: ValidationOptions
) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions, length],
            validator: ValidateMinLengthConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateMinLength(UserConstants.MinPhoneLength, { constraints: { field: 'Mobile number' } })
  phoneNumber: string;

  OR

  // Can use values from error.json eg, ERR_MIN_LENGTH, ERR_NOT_VALID etc(any key from error.json)
  @ValidateMinLength(UserConstants.MinPhoneLength, { constraints: { field: 'Mobile number' }, message: 'ERR_MIN_LENGTH'  }) 
  phoneNumber: string;

  OR
  
  // Can use custom message
  @ValidateMinLength(UserConstants.MinPhoneLength, { constraints: { field: 'Mobile number' } , message: "Phone Number is too short" })
  phoneNumber: string;

===============================================: EXAMPLE :======================================================
*/
