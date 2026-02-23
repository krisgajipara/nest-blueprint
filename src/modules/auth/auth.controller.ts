import {
    AuthResponseDto,
    AuthService,
    ChangePasswordRequestDto,
    ForgotPasswordRequestDto,
    LoginRequestDto,
    OtpLeftTimeRequestDto,
    OtpLeftTimeResponseDto,
    OtpVerifyRequestDto,
    RegisterRequestDto,
    ResendOtpRequestDto,
    ResetPasswordRequestDto,
    UserResponseDto
} from "@business-core-modules";
import { AppResponse } from "@business-core-dto";
import { SuccessConstant } from "@core-constants";
import { ApiResponseStatus, GetUser } from "@core-custom-decorators";
import { JwtAuthGuard } from "@core-custom-guards";
import { User } from "@core-database";
import { Body, Controller, Get, HttpStatus, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { MapToModuleName } from "@core-utilities";
import { ModuleNames } from "@core-enums";

// Module name constants for decorators (evaluated at module load time)
const AUTH_MODULE_NAME = MapToModuleName(ModuleNames.AUTH);

/**
 * Auth controller for authentication-related API endpoints
 * Handles user authentication, OTP verification, and password management
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("login")
    @ApiResponseStatus(
        "User login with email and password",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED],
        AUTH_MODULE_NAME,
        AuthResponseDto
    )
    login(@Body() loginDto: LoginRequestDto): Promise<AppResponse<AuthResponseDto>> {
        return this.authService.loginUser(loginDto);
    }

    @Post("register")
    @ApiResponseStatus(
        "Register a new user account",
        [HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT],
        AUTH_MODULE_NAME
    )
    register(@Body() registerDto: RegisterRequestDto): Promise<AppResponse<{}>> {
        return this.authService.register(registerDto);
    }

    @Post("otp-verify")
    @ApiResponseStatus(
        "Verify OTP for login or registration",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        AUTH_MODULE_NAME,
        AuthResponseDto
    )
    otpVerify(@Body() otpVerifyDto: OtpVerifyRequestDto): Promise<AppResponse<AuthResponseDto>> {
        return this.authService.otpVerify(otpVerifyDto);
    }

    @Post("otp-left-time")
    @ApiResponseStatus(
        "Get remaining time before OTP expires",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        AUTH_MODULE_NAME,
        OtpLeftTimeResponseDto
    )
    getOtpLeftTime(@Body() data: OtpLeftTimeRequestDto): Promise<AppResponse<OtpLeftTimeResponseDto>> {
        return this.authService.getOtpLeftTime(data);
    }

    @Post("resend-otp")
    @ApiResponseStatus(
        "Resend OTP to user email",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        AUTH_MODULE_NAME
    )
    resendOtp(@Body() resendOtpDto: ResendOtpRequestDto): Promise<AppResponse<{}>> {
        return this.authService.resendOtp(resendOtpDto);
    }

    @Put("change-password")
    @UseGuards(JwtAuthGuard)
    @ApiResponseStatus(
        "Change user password with old password verification",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_ACCEPTABLE],
        AUTH_MODULE_NAME
    )
    changePassword(@Body() changePasswordDto: ChangePasswordRequestDto, @GetUser() user: User): Promise<AppResponse<{}>> {
        return this.authService.changePassword(changePasswordDto, user);
    }

    @Post("forgot-password")
    @ApiResponseStatus(
        "Initiate password reset process",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.NOT_ACCEPTABLE],
        AUTH_MODULE_NAME
    )
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto): Promise<AppResponse<{}>> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post("reset-password")
    @ApiResponseStatus(
        "Reset password using valid reset token",
        [HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
        AUTH_MODULE_NAME
    )
    resetPassword(@Body() resetPasswordDto: ResetPasswordRequestDto): Promise<AppResponse<{}>> {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBearerAuth()
    @ApiResponseStatus(
        "Get current user profile",
        [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
        AUTH_MODULE_NAME,
        UserResponseDto
    )
    getProfile(@GetUser() user: User): AppResponse<UserResponseDto> {
        const responseDto = new UserResponseDto(user);

        return new AppResponse(SuccessConstant.SuccessAction, responseDto, {
            module: MapToModuleName(ModuleNames.USER),
            action: "retrieved"
        });
    }
}
