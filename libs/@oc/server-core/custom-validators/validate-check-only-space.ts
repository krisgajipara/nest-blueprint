import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
@Injectable()
@ValidatorConstraint()
export class ValidateOnlySpaceConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any) {
        return !!(value === undefined || typeof value !== "string" || value.trim().length !== 0 || value.length === 0);
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        return `${Translation.Translator(
            language,
            TranslationFile.Error,
            message || "ERR_ONLY_SPACE",
            constraints
        )}&&&${args.property}`;
    }
}

export function ValidateOnlySpace(validationOptions: IDynamicValidationOptions, options?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateOnlySpaceConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateOnlySpace({ constraints: { field: "country code" } })
  comments: string;

  OR

  // Can use values from error.json
  @ValidateOnlySpace({ message: "ERR_ONLY_SPACE" }) 
  comments: string;

  OR
  
  @ValidateOnlySpace({ message: "Comments should not be empty" })
  comments: string;

===============================================: EXAMPLE :======================================================
*/
