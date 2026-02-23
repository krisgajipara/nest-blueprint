import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import {
    isNumber,
    min,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
@ValidatorConstraint({ async: false })
export class ValidateMinValueConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any, args: ValidationArguments) {
        const minNumber = args.constraints[1] as number;
        if (isNumber(value)) {
            return min(value, minNumber);
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        constraints.min = args.constraints[1];

        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_MIN_VALUE", constraints)}&&&${
            args.property
        }`;
    }
}

/**
 * Validate that the value of a property is greater than or equal to a given limit.
 * @param {number} limit The minimum value that the property can be.
 * @param {IDynamicValidationOptions} validationOptions The options to pass to the @Validator decorator.
 * @param {ValidationOptions} options The options to pass to the validator.
 * @returns {(object: Object, propertyName: string) => void} A decorator that can be used to validate a property.
 */

export function ValidateMinValue(
    limit: number,
    validationOptions: IDynamicValidationOptions,
    options?: ValidationOptions
) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions, limit],
            validator: ValidateMinValueConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateMinValue(CommonConstants.PriceMinLength, { constraints: { field: "price" } })
  price: number;

  OR

  // Can use any values from error.json
  @ValidateMinValue(CommonConstants.PriceMinLength, { constraints: { field: "price" }, message: "ERR_MIN_VALUE" }) 
  price: number;

  OR
  
  // Can pass values custom message
  @ValidateMinValue(CommonConstants.PriceMinLength, { constraints: { field: "price" } , message: "Price is too small" }) 
  price: number;

===============================================: EXAMPLE :======================================================
*/
