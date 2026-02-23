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
@ValidatorConstraint({ async: false })
export class ValidateDateNotFutureConstraint implements ValidatorConstraintInterface {
    constructor() {}
    validate(value: string) {
        if (!value) return false;

        const paymentDate = new Date(value);
        if (isNaN(paymentDate.getTime())) return false; // Invalid date

        // Create today's date in local timezone but at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create normalized payment date
        const paymentDateNormalized = new Date(paymentDate);
        paymentDateNormalized.setHours(0, 0, 0, 0);

        return paymentDateNormalized.getTime() <= today.getTime();
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

export function ValidateDateNotFuture(validationOptions?: IDynamicValidationOptions, options?: ValidationOptions) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateDateNotFutureConstraint
        });
    };
}
