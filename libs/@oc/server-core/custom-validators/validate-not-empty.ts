import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import {
    isNotEmpty,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

@Injectable()
@ValidatorConstraint({ async: false })
export class ValidateNotEmptyConstraint implements ValidatorConstraintInterface {
    constructor() {}
    validate(value: any) {
        return isNotEmpty(value);
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";

        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_REQUIRED", constraints)}&&&${
            args.property
        }`;
    }
}

export function ValidateNotEmpty(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateNotEmptyConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
    
  @ValidateNotEmpty({ constraints: { field: "Email" } })
  email: string;

  OR

  // Can use values from error.json
  @ValidateNotEmpty({ message: "ERR_NOT_VALID" }) 
  email: string;

  OR
  
  // Can use custom message
  @ValidateNotEmpty({ message: "Email is required" }) 
  email: string;

===============================================: EXAMPLE :======================================================
*/
