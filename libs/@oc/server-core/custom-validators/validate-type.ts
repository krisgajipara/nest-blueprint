import { TranslationFile } from "@core-enums";
import { Injectable } from "@nestjs/common";
import {
    isArray,
    isBoolean,
    isBooleanString,
    isDate,
    isDateString,
    isNumber,
    isNumberString,
    isString,
    isUUID,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { FieldTypeEnum } from "../enums/field-type.enum";

import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";
import { Translation } from "../utilities/translation.utility";
@Injectable()
@ValidatorConstraint()
export class ValidateTypeConstraint implements ValidatorConstraintInterface {
    constructor() {}
    validate(value: any, args: ValidationArguments) {
        const { type } = args.constraints[0].constraints;

        if (value) {
            switch (type) {
                case FieldTypeEnum.String:
                    return isString(value);

                case FieldTypeEnum.Number:
                    return isNumber(value);

                case FieldTypeEnum.NumberString:
                    return isNumberString(value);

                case FieldTypeEnum.Boolean:
                    return isBoolean(value);

                case FieldTypeEnum.BooleanString:
                    return isBooleanString(value);

                case FieldTypeEnum.Date:
                    return isDate(value);

                case FieldTypeEnum.DateString:
                    return isDateString(value);

                case FieldTypeEnum.UUID:
                    return isUUID(value);

                case FieldTypeEnum.Array:
                    return isArray(value);

                default:
                    return true;
            }
        } else {
            return true;
        }
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";

        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_TYPE", constraints)}&&&${
            args.property
        }`;
    }
}

export function ValidateType(validationOptions: IDynamicValidationOptions, options?: ValidationOptions) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions],
            validator: ValidateTypeConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateType({ constraints: { field: 'phoneNumber', type: FieldTypeEnum.String } })
  phoneNumber: string;

  OR

  // Can use values from error.json
  @ValidateType({ constraints: { field: 'phoneNumber', type: FieldTypeEnum.String } , message: "ERR_TYPE" }) 
  phoneNumber: string;

  OR
  
  // Can use custom message
  @ValidateType({ constraints: { field: 'phoneNumber', type: FieldTypeEnum.String } , message: "ERR_TYPE" }) 
  phoneNumber: string;

===============================================: EXAMPLE :======================================================
*/
