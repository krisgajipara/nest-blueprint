import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { IDynamicValidationOptions } from "../interfaces/dynamic-validation-option.interface";
import { Translation } from "../utilities/translation.utility";
import { Injectable } from "@nestjs/common";
import { EntityTarget } from "typeorm";

import { TranslationFile } from "@core-enums";
@Injectable()
@ValidatorConstraint({ async: true })
export class ValidateActiveRecordConstraint implements ValidatorConstraintInterface {
    constructor() {}
    async validate(value: any, args: ValidationArguments) {
        if (typeof value !== "string" || value.trim() === "") {
            return true;
        }

        const entity = args.constraints[1];

        const records = await entity
            .createQueryBuilder("r")
            .where("r.id = :id", { id: value })
            .select(["1"])
            .getRawOne();

        return !!records;
    }

    defaultMessage(args: ValidationArguments) {
        const { message, constraints } = args.constraints[0] as IDynamicValidationOptions;

        // Get dynamic language from RequestContextService
        const language = "en";
        return `${Translation.Translator(language, TranslationFile.Error, message || "ERR_DELETED", constraints)}&&&${
            args.property
        }`;
    }
}
/**
 * @param entityTarget The entity must have isActive column
 * @param validationOptions
 * @param options
 * @returns
 */
export function ValidateActiveRecord<T>(
    entityTarget: EntityTarget<T>,
    validationOptions: IDynamicValidationOptions,
    options?: ValidationOptions
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: options,
            constraints: [validationOptions, entityTarget],
            validator: ValidateActiveRecordConstraint
        });
    };
}

/*
===============================================: EXAMPLE :======================================================
  
  @ValidateActiveRecord(User, { constraints: { field: "User" } })
  userId: string;

  OR

  // Can use values from error.json
  @ValidateActiveRecord(User, { constraints: { field: "User" }, message: "ERR_TYPE" }) 
  userId: string;

  OR
  
  // Can use custom message
  @ValidateActiveRecord(User, { constraints: { field: "User" }, message: "User not found" }) 
  userId: string;

===============================================: EXAMPLE :======================================================
*/
