import { UserStatus, UserTypeEnum } from "@core-enums";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Response DTO for user data
 */
export class UserResponseDto {
    /**
     * Constructor to map User entity to response DTO
     * @param user - User entity from repository
     */
    constructor(user: any) {
        // Map core fields
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.phoneNumber = user.phoneNumber;
        this.dateOfBirth = user.dateOfBirth;
        this.userType = user.userType;
        this.status = user.status;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.roleId = user.roleId;

        // Password and salt are intentionally not mapped (excluded from response)
        // idProofUrls and documents would be computed from user entity relationships if needed
    }

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
        example: "john.doe@example.com"
    })
    email: string;

    @ApiProperty({
        description: "User's phone number",
        example: "+1234567890",
        nullable: true
    })
    phoneNumber: string | null;

    @ApiProperty({
        description: "User's age",
        example: 30,
        nullable: true
    })
    age: number | null;

    @ApiProperty({
        description: "User's date of birth",
        example: "1990-01-01",
        nullable: true
    })
    dateOfBirth: string | null;

    @ApiProperty({
        description: "User's type",
        example: UserTypeEnum.USER,
        enum: UserTypeEnum
    })
    userType: UserTypeEnum;


    @ApiProperty({
        description: "User's role ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
        nullable: true
    })
    roleId: string | null;

    @ApiProperty({
        description: "User's status",
        example: UserStatus.ACTIVE,
        enum: UserStatus
    })
    status: UserStatus;

    @ApiProperty({
        description: "Account creation timestamp",
        example: "2023-01-01T00:00:00.000Z"
    })
    createdAt: Date;

    @ApiProperty({
        description: "Account last update timestamp",
        example: "2023-01-01T00:00:00.000Z"
    })
    updatedAt: Date;
}
