import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import {
    isEnum,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
@Injectable()
@ValidatorConstraint({ async: true })
export class ValidateEnumTypeConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any, args: ValidationArguments) {
        if (value === undefined || value === null) {
            return true; // Allow undefined/null values for optional fields
        }

        const enumType = args.constraints[0];

        // If value is a string, try to convert it to the corresponding enum value
        if (typeof value === "string") {
            const numericValue = parseInt(value, 10);
            if (!isNaN(numericValue)) {
                return isEnum(numericValue, enumType);
            }
            // Also check if the string itself matches any enum value
            return isEnum(value, enumType);
        }

        return isEnum(value, args.constraints[0]);
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[1] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_IS_ENUM", constraints)}&&&${
            args.property
        }`;
    }
}

export function ValidateEnumType(
    types: Object,
    validationOptions?: IDynamicValidationOptions,
    options?: ValidationOptions
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [types, validationOptions],
            validator: ValidateEnumTypeConstraint
        });
    };
}
/*
===============================================: EXAMPLE :======================================================
    
    @ValidateEnumType(MatchStatusEnum,{ constraints: { field: 'Status' } })
    status: string;

    OR

    // Using any values from error.json
    @ValidateEnumType(MatchStatusEnum, message: 'ERR_IS_ENUM' })
    status: string;

    OR
    // Using a custom message
    @ValidateEnumType(MatchStatusEnum, message: 'status must be a valid enum value.' })
    status: string;
    
===============================================: EXAMPLE :======================================================
*/
