import { Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";

const logger = new Logger("DatabaseExceptionUtility");

/**
 * Handles database-specific errors from TypeORM QueryFailedError exceptions.
 *
 * **Working Pattern:**
 * 1. Extracts the PostgreSQL error code from the driver error
 * 2. Maps the error code to appropriate error message keys
 * 3. Parses error details to extract field/column information where possible
 * 4. Returns structured error response with message key and field parameter
 *
 * **Advantages:**
 * - Provides user-friendly error messages instead of raw database errors
 * - Includes specific field information for better error localization
 * - Supports internationalization through translation keys
 * - Handles multiple PostgreSQL error types comprehensively
 * - Maintains consistent error response format across the application
 *
 * @param exception - The QueryFailedError thrown by TypeORM
 * @returns Structured error response with message key and field information
 */
export const handleDatabaseError = (exception: QueryFailedError): any => {
    const driverError = exception.driverError as any;
    logger.debug(`Handling database error with code: ${driverError.code}`);

    // Handle PostgreSQL error codes
    switch (driverError.code) {
        case "23503": {
            // Foreign key violation
            const fkField = extractFieldFromDetail(driverError.detail);
            logger.debug(`Foreign key violation on field: ${fkField}`);
            return {
                message: "ERR_FOREIGN_KEY_VIOLATION",
                field: fkField || "unknown field"
            };
        }
        case "23505": {
            // Unique violation
            const uniqueField = extractFieldFromDetail(driverError.detail);
            logger.debug(`Unique constraint violation on field: ${uniqueField}`);
            return {
                message: "ERR_UNIQUE_CONSTRAINT_VIOLATION",
                field: uniqueField || "unknown field"
            };
        }
        case "23502": {
            // Not null violation
            const notNullField = extractColumnFromDetail(driverError.detail);
            logger.debug(`Not null violation on column: ${notNullField}`);
            return {
                message: "ERR_NOT_NULL_VIOLATION",
                field: notNullField || "unknown field"
            };
        }
        case "23514": // Check violation
            logger.debug("Check constraint violation");
            return { message: "ERR_CHECK_CONSTRAINT_VIOLATION" };
        case "42703": // Undefined column
            logger.debug("Undefined column error");
            return { message: "ERR_UNDEFINED_COLUMN" };
        case "42P01": // Undefined table
            logger.debug("Undefined table error");
            return { message: "ERR_UNDEFINED_TABLE" };
        default:
            logger.error("Unhandled database error:", driverError);
            return { message: "ERR_DATABASE_ERROR" };
    }
};

/**
 * Extracts field names from PostgreSQL error detail messages.
 *
 * **Working Pattern:**
 * - Uses regex patterns to match common PostgreSQL error detail formats
 * - Handles foreign key violation details: "Key (field_name)=(value) is not present..."
 * - Handles unique constraint details: "Key (field_name)=(value) already exists..."
 * - Returns the extracted field name or null if not found
 *
 * **Advantages:**
 * - Provides specific field information in error messages
 * - Helps users identify exactly which field caused the constraint violation
 * - Improves error message clarity and debugging experience
 * - Handles multiple PostgreSQL error detail formats
 *
 * @param detail - The PostgreSQL error detail string
 * @returns The extracted field name or null if not found
 */
export const extractFieldFromDetail = (detail: string): string | null => {
    if (!detail) return null;

    // For FK: "Key (field_name)=(value) is not present in table "table_name"."
    const fkRegex = /Key \(([^)]+)\)=\([^)]+\) is not present/;
    const fkMatch = fkRegex.exec(detail);
    if (fkMatch) return fkMatch[1];

    // For unique: "Key (field_name)=(value) already exists."
    const uniqueRegex = /Key \(([^)]+)\)=\([^)]+\) already exists/;
    const uniqueMatch = uniqueRegex.exec(detail);
    if (uniqueMatch) return uniqueMatch[1];

    return null;
};

/**
 * Extracts column names from PostgreSQL error detail messages.
 *
 * **Working Pattern:**
 * - Uses regex patterns to match PostgreSQL not-null constraint error details
 * - Handles not-null violation details: "null value in column "column_name" violates not-null constraint"
 * - Returns the extracted column name or null if not found
 *
 * **Advantages:**
 * - Identifies which required field was not provided
 * - Helps users understand exactly which column needs to be filled
 * - Improves form validation error messages
 * - Provides actionable feedback for required field errors
 *
 * @param detail - The PostgreSQL error detail string
 * @returns The extracted column name or null if not found
 */
export const extractColumnFromDetail = (detail: string): string | null => {
    if (!detail) return null;

    // For not null: "null value in column "column_name" violates not-null constraint"
    const notNullRegex = /null value in column "([^"]+)" violates not-null constraint/;
    const notNullMatch = notNullRegex.exec(detail);
    if (notNullMatch) return notNullMatch[1];

    return null;
};
