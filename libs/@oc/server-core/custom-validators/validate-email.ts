import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import {
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    isEmail,
    registerDecorator
} from "class-validator";
@Injectable()
@ValidatorConstraint({ async: true })
export class ValidateEmailConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: string) {
        if (typeof value !== "string") return true;

        if (value && value.trim().length !== 0 && value != "" && !isEmail(value)) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_NOT_VALID", constraints)}&&&${
            args.property
        }`;
    }
}

export function ValidateEmail(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [validationOptions],
            options: options,
            validator: ValidateEmailConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
    
  @ValidateEmail({ constraints: { field: "Email" } })
  email: string;

  OR

  @ValidateEmail({ message: "ERR_NOT_VALID" }) // Can use values from error.json
  email: string;

  OR
  
  @ValidateEmail({ message: "Please enter a valid email address" }) // Can use custom message
  email: string;

===============================================: EXAMPLE :======================================================
*/
