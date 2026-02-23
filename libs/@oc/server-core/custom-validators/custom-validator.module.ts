import { ValidateActiveRecordConstraint } from "./validate-active-record";
import { ValidateAlphaNumericConstraint } from "./validate-alpha-numeric";
import { ValidateDateNotFutureConstraint } from "./validate-date-not-future";
import { ValidateEmailConstraint } from "./validate-email";
import { ValidateEnumTypeConstraint } from "./validate-enum-type";
import { ValidateMaxLengthConstraint } from "./validate-max-length";
import { ValidateMaxValueConstraint } from "./validate-max-value";
import { ValidateMinLengthConstraint } from "./validate-min-length";
import { ValidateMinValueConstraint } from "./validate-min-value";
import { ValidateNotEmptyConstraint } from "./validate-not-empty";
import { ValidateOnlySpaceConstraint } from "./validate-check-only-space";
import { ValidateTypeConstraint } from "./validate-type";
import { ValidateUniqueArrayItemConstraint } from "./validate-unique-array-item";
import { ValidateOptionalConstraint } from "./validate-optional";
import { Module } from "@nestjs/common";

@Module({
    providers: [
        ValidateActiveRecordConstraint,
        ValidateOnlySpaceConstraint,
        ValidateTypeConstraint,
        ValidateDateNotFutureConstraint,
        ValidateEmailConstraint,
        ValidateAlphaNumericConstraint,
        ValidateUniqueArrayItemConstraint,
        ValidateEnumTypeConstraint,
        ValidateNotEmptyConstraint,
        ValidateMaxLengthConstraint,
        ValidateMinLengthConstraint,
        ValidateMaxValueConstraint,
        ValidateMinValueConstraint,
        ValidateOptionalConstraint
    ],
    exports: [
        ValidateActiveRecordConstraint,
        ValidateOnlySpaceConstraint,
        ValidateTypeConstraint,
        ValidateDateNotFutureConstraint,
        ValidateEmailConstraint,
        ValidateAlphaNumericConstraint,
        ValidateUniqueArrayItemConstraint,
        ValidateEnumTypeConstraint,
        ValidateNotEmptyConstraint,
        ValidateMaxLengthConstraint,
        ValidateMinLengthConstraint,
        ValidateMaxValueConstraint,
        ValidateMinValueConstraint,
        ValidateOptionalConstraint
    ]
})
export class CustomValidatorModule { }
