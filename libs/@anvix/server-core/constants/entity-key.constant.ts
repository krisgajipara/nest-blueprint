/**
 * Database unique key constants for constraints and indexes
 * Format: `UK_{TABLE_NAME}_{FIELD1_FIELD2}` (all CAPITAL letters, underscore-separated)
 */
export enum DatabaseUniqueKey {
    UserEmailUserType = "UK_USER_EMAIL_USER_TYPE",
    ServiceCategoryTenantName = "UK_SERVICE_CATEGORY_TENANT_NAME",
    ServiceTenantCategoryName = "UK_SERVICE_TENANT_CATEGORY_NAME",
    ServiceStaffMappingTenantServiceStaff = "UK_SERVICE_STAFF_MAPPING_TENANT_SERVICE_STAFF"
}
