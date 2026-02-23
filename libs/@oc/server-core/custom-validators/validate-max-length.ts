import {
    isNotEmpty,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
@ValidatorConstraint({ async: false })
export class ValidateMaxLengthConstraint implements ValidatorConstraintInterface {
    constructor() {}
    validate(value: any, args: ValidationArguments) {
        const length = args.constraints[1] as number;
        if (typeof value !== "string" || !isNotEmpty(value)) {
            return true;
        }

        if (value.length > length) {
            return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;
        // Get dynamic language from RequestContextService
        const language = "en";

        constraints.max = args.constraints[1];
        return `${Translation.Translator(
            language,
            TranslationFile.Error,
            message || "ERR_MAX_LENGTH",
            constraints
        )}&&&${args.property}`;
    }
}

export function ValidateMaxLength(
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
            validator: ValidateMaxLengthConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateMaxLength(UserConstants.PhoneLength, { constraints: { field: 'Mobile number' } })
  phoneNumber: string;

  OR

  // Can use values from error.json eg, ERR_MAX_LENGTH, ERR_NOT_VALID etc(any key from error.json)
  @ValidateMaxLength(UserConstants.PhoneLength, { constraints: { field: 'Mobile number' }, message: 'ERR_MAX_LENGTH'  }) 
  phoneNumber: string;

  OR
  
  // Can use custom message
  @ValidateMaxLength(UserConstants.PhoneLength, { constraints: { field: 'Mobile number' } , message: "Phone Number is too long" })
  phoneNumber: string;

===============================================: EXAMPLE :======================================================
*/
