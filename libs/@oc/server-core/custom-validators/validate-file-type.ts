import { TranslationFile } from "@core-enums";
import { Injectable } from "@nestjs/common";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import * as path from "path";

import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";
import { Translation } from "../utilities/translation.utility";

@Injectable()
@ValidatorConstraint()
export class ValidateFileTypeConstraint implements ValidatorConstraintInterface {
    constructor() {}

    validate(value: any, args: ValidationArguments) {
        const { allowedTypes } = args.constraints[0].constraints;

        if (Array.isArray(value)) {
            // Handle array of files
            if (value.length === 0) return true; // No files, skip
            return value.every((file) => {
                if (file?.path) {
                    const fileExtension = path.extname(file.originalname || file.filename).toLowerCase();
                    return allowedTypes.includes(fileExtension);
                }
                return true; // Skip if file object not present
            });
        } else if (value?.path) {
            // Single file
            const fileExtension = path.extname(value.originalname || value.filename).toLowerCase();
            return allowedTypes.includes(fileExtension);
        }

        return true; // Skip validation if file is not present
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";

        constraints.allowedTypesString = constraints.allowedTypes.join(", ");
        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_FILE_TYPE", constraints)}&&&${args.property}`;
    }
}

export function ValidateFileType(validationOptions: IDynamicValidationOptions, options?: ValidationOptions) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateFileTypeConstraint
        });
    };
}
