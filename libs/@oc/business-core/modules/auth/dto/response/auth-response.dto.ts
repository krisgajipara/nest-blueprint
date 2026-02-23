import { ApiProperty } from "@nestjs/swagger";
import { UserTypeEnum } from "@core-enums";
import { User } from "@core-database";

/**
 * Private DTO class for user information in auth response
 */
class AuthUserResponseDto {
    @ApiProperty({
        description: "User's unique identifier",
        example: "123e4567-e89b-12d3-a456-426614174000"
    })
    id: string;

    @ApiProperty({
        description: "User's first name",
        example: "John"
    })
    firstName: string;

    @ApiProperty({
        description: "User's last name",
        example: "Doe"
    })
    lastName: string;

    @ApiProperty({
        description: "User's email address",
        example: "user@example.com"
    })
    email: string;


    @ApiProperty({
        description: "User's type",
        example: UserTypeEnum.SUPER_ADMIN,
        enum: UserTypeEnum,
        nullable: true
    })
    userType: UserTypeEnum | null;

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        email: string,
        userType: UserTypeEnum | null
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userType = userType;
    }
}

/**
 * Auth response DTO for login and OTP verification
 */
export class AuthResponseDto {
    @ApiProperty({
        description: "Indicates if OTP verification is required",
        example: false
    })
    otpRequired: boolean;

    @ApiProperty({
        description: "JWT access token",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        required: false
    })
    accessToken?: string;

    @ApiProperty({
        description: "JWT refresh token",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        required: false
    })
    refreshToken?: string;

    @ApiProperty({
        description: "User information",
        type: AuthUserResponseDto,
        required: false
    })
    user?: AuthUserResponseDto;

    /**
     * Constructor for mapping user data
     * @param user - User entity to map
     * @param accessToken - JWT access token
     * @param refreshToken - JWT refresh token
     * @param otpRequired - Whether OTP verification is required
     */
    constructor(user?: User & Record<string, any>, accessToken?: string, refreshToken?: string, otpRequired?: boolean) {
        this.otpRequired = otpRequired || false;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        if (user) {
            this.user = new AuthUserResponseDto(
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.userType
            );
        }
    }
}

/**
 * OTP left time response DTO
 */
export class OtpLeftTimeResponseDto {
    @ApiProperty({
        description: "Remaining time in seconds",
        example: 300
    })
    leftTime: number;

    /**
     * Constructor for OTP left time response
     * @param leftTime - Remaining time in seconds
     */
    constructor(leftTime: number) {
        this.leftTime = leftTime;
    }
}
