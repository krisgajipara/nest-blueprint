import { TranslationFile } from "@core-enums";

import { IDynamicValidationOptions } from "@core-interfaces";
import { Translation } from "@core-utilities";
import { Injectable } from "@nestjs/common";
import { RequestContextService } from "../generic-service/request-context.service";
import {
    isNumber,
    max,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
@Injectable()
@ValidatorConstraint({ async: false })
export class ValidateMaxValueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly requestContextService: RequestContextService) {}
    validate(value: any, args: ValidationArguments) {
        const maxNumber = args.constraints[1] as number;
        if (isNumber(value)) {
            return max(value, maxNumber);
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = this.requestContextService.getLanguage();
        constraints.max = args.constraints[1];

        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_MAX_VALUE", constraints)}&&&${
            args.property
        }`;
    }
}

export function ValidateMaxValue(
    length: number,
    validationOptions: IDynamicValidationOptions,
    options?: ValidationOptions
) {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions, length],
            validator: ValidateMaxValueConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateMaxValue(CommonConstants.MaxPageSize, { constraints: { field: "limit" } })
  limit: number;

  OR

  // Can use any values from error.json
  @ValidateMaxValue(CommonConstants.MaxPageSize, { constraints: { field: "limit" }, message: "ERR_MAX_VALUE" }) 
  limit: number;

  OR
  
  // Can pass values custom message
  @ValidateMaxValue(CommonConstants.MaxPageSize, { constraints: { field: "limit" } , message: "Limit is too large" }) 
  limit: number;

===============================================: EXAMPLE :======================================================
*/
