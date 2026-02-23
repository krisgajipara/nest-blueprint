import { TranslationFile } from "@core-enums";
import { Injectable } from "@nestjs/common";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";
import { Translation } from "../utilities/translation.utility";

@Injectable()
@ValidatorConstraint()
export class ValidateFileSizeConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any, args: ValidationArguments) {
        const { minSize, maxSize } = args.constraints[0].constraints;

        if (value && value.size !== undefined) {
            const fileSizeInBytes = value.size;

            if (minSize && fileSizeInBytes < minSize) {
                return false;
            }

            if (maxSize && fileSizeInBytes > maxSize) {
                return false;
            }

            return true;
        }

        return true; // Skip validation if file is not present
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";

        // Convert bytes to MB for display
        if (constraints.minSize) {
            constraints.minSizeMB = (constraints.minSize / (1024 * 1024)).toFixed(2);
        }
        if (constraints.maxSize) {
            constraints.maxSizeMB = (constraints.maxSize / (1024 * 1024)).toFixed(2);
        }

        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_FILE_SIZE", constraints)}&&&${args.property}`;
    }
}

export function ValidateFileSize(validationOptions: IDynamicValidationOptions, options?: ValidationOptions) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateFileSizeConstraint
        });
    };
}
