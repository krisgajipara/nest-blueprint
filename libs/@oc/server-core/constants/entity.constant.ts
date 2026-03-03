/**
 * Entity field length constants
 */
export const UserEntityConstant = {
    FirstNameMaxLength: 100,
    LastNameMaxLength: 100,
    EmailMaxLength: 50,
    PhoneNumberMaxLength: 15,
    PasswordMaxLength: 20,
    PasswordMinLength: 6,
    EncryptedPasswordMaxLength: 250,
    SocialAccountIdMaxLength: 255,
    SaltMaxLength: 50,
    RefreshTokenMaxLength: 255,
    IdProofAllowedExtensions: ["jpg", "jpeg", "png", "pdf"]
};

export const OtpEntityConstant = {
    OtpLength: 6
};

export const RoleEntityConstant = {
    NameMaxLength: 100,
    DescriptionMaxLength: 500
};

export const TenantEntityConstant = {
    NameMaxLength: 100,
    SubdomainMaxLength: 50
};