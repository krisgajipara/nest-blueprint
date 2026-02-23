import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import {
    isArray,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

@Injectable()
@ValidatorConstraint()
export class ValidateUniqueArrayItemConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any) {
        if (!isArray(value)) return true;

        return !value || (value && new Set(value).size == value.length);
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";

        return `${Translation.Translator(
            language,
            TranslationFile.Error,
            message || "ERR_UNIQUE_ARRAY_ITEM",
            constraints
        )}&&&${args.property}`;
    }
}

export function ValidateUniqueArrayItem(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [validationOptions],
            options: options,
            validator: ValidateUniqueArrayItemConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateDuplicateArrayItem(User, { constraints: { field: "filterByStatus" } })
  filterByStatus: number[];

  OR

  // Can use values from error.json  filterByStatus: number[];
  @ValidateDuplicateArrayItem(User, { constraints: { field: "filterByStatus" }, message: "ERR_UNIQUE_ARRAY_ITEM" }) 
  filterByStatus: number[];

  OR
  
  // Can use custom message
  @ValidateDuplicateArrayItem(User, { constraints: { field: "filterByStatus" }, message: "Duplicate values are not allowed in filterByStatus" }) 
  filterByStatus: number[];

===============================================: EXAMPLE :======================================================
*/
