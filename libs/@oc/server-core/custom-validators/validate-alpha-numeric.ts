import { Injectable } from "@nestjs/common";
import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator
} from "class-validator";

import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";
import { Translation } from "../utilities/translation.utility";

import { TranslationFile } from "@core-enums";
@Injectable()
@ValidatorConstraint()
export class ValidateAlphaNumericConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any) {
        const format = /^[a-zA-Z0-9]*$/;
        return format.test(value);
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        return `${Translation.Translator(
            language,
            TranslationFile.Error,
            message || "ERR_ALPHA_NUMERIC",
            constraints
        )}&&&${args.property}`;
    }
}

export function ValidateAlphaNumeric(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [validationOptions],
            options: options,
            validator: ValidateAlphaNumericConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateAlphaNumeric({ constraints: { field: "userName" } })
  userName: string;

  OR

  // Can use values from error.json
  @ValidateAlphaNumeric({ message: "ERR_ALPHA_NUMERIC" }) 
  userName: string;

  OR
  
  // Can use custom message
  @ValidateAlphaNumeric({ message: "User name should be alpha numeric" })
  userName: string;
===============================================: EXAMPLE :======================================================
*/
