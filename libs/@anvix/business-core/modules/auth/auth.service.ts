import { AppResponse } from "@business-core-dto";
import { ModuleNames, OtpType, UserStatus, UserTypeEnum } from "@core-enums";
import { AppJwtService, AppMailerService } from "@core-shared-modules";
import { GenerateOtpNumber, MapToModuleName } from "@core-utilities";
import { ConflictException, Injectable, Logger, NotAcceptableException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { AuthRepository } from "./auth.repository";

import { SuccessConstant } from "@core-constants";
import { User } from "@core-database";
import {
    ChangePasswordRequestDto,
    ForgotPasswordRequestDto,
    LoginRequestDto,
    OtpLeftTimeRequestDto,
    OtpVerifyRequestDto,
    RegisterRequestDto,
    ResendOtpRequestDto,
    ResetPasswordRequestDto
} from "./dto/request";
import { AuthResponseDto, OtpLeftTimeResponseDto } from "./dto/response/auth-response.dto";

/**
 * Auth service for authentication-related operations
 * Implements all methods from the functional prompts
 */
@Injectable()
export class AuthService {
    readonly #logger: Logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly authRepository: AuthRepository,
        private readonly appJwtService: AppJwtService,
        private readonly configService: ConfigService,
        private readonly appMailerService: AppMailerService
    ) { }

    /**
     * Authenticate user with email and password, optionally requiring OTP verification
     */
    async loginUser(loginDto: LoginRequestDto): Promise<AppResponse<AuthResponseDto>> {
        const logPrefix = this.loginUser.name;

        this.#logger.debug(`${logPrefix} : Authenticating user with email: ${loginDto.email}`);

        // Validate user credentials
        const user = await this.userService.findUserByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException({ message: "ERR_EMAIL_NOT_FOUND" });
        }

        // Verify password using entity method
        const isPasswordValid = await user.validatePassword(loginDto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException({ message: "ERR_INVALID_CREDENTIALS" });
        }

        // Check user status
        if (user.status !== UserStatus.ACTIVE) {
            throw new NotAcceptableException({ message: "ERR_ACCOUNT_INACTIVE" });
        }

        // Check if OTP is enabled in config
        const otpEnabled = this.configService.get<boolean>("app.otp.enabled", false);

        if (otpEnabled) {
            // Generate 6-digit OTP
            const otpCode = GenerateOtpNumber.generateOtp();
            const expireTime = new Date();
            expireTime.setMinutes(expireTime.getMinutes() + this.configService.get<number>("app.otp.expire_time", 10));

            // Save OTP to database
            await this.authRepository.createOtp({
                otpCode,
                otpType: OtpType.LOGIN,
                expireAt: expireTime,
                userId: user.id,
                isUsed: false
            });

            // Send OTP via email using the correct method
            await this.appMailerService.LoginOtpSend(user, otpCode);

            const response: AuthResponseDto = {
                otpRequired: true
            };

            this.#logger.debug(`${logPrefix} : OTP verification required for user: ${user.id}`);

            return new AppResponse(
                "OTP verification required. Please check your email for the verification code.",
                response
            );
        } else {
            // Generate JWT tokens
            const tokens = await this.appJwtService.generateJWTToken(user, loginDto.rememberMe);

            // Store tokens in database
            await this.authRepository.storeLoginToken(tokens.accessToken, tokens.refreshToken, user.id);

            const response = new AuthResponseDto(user, tokens.accessToken, tokens.refreshToken, false);

            this.#logger.debug(`${logPrefix} : User authenticated successfully: ${user.id}`);

            return new AppResponse(SuccessConstant.SuccessAction, response, {
                module: MapToModuleName(ModuleNames.USER),
                action: "logged in"
            });
        }
    }

    /**
     * Register a new user account
     */
    async register(registerDto: RegisterRequestDto): Promise<AppResponse<{}>> {
        const logPrefix = this.register.name;

        this.#logger.debug(`${logPrefix} : Registering new user with email: ${registerDto.email}`);

        // Check if email already exists
        const existingUser = await this.userService.findUserByEmail(registerDto.email, registerDto.userType);
        if (existingUser) {
            throw new ConflictException({ message: "ERR_EMAIL_EXISTS" });
        }

        // Create user with PENDING_VERIFICATION status
        const userEntity: any = {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email: registerDto.email,
            password: registerDto.password,
            phoneNumber: registerDto.phoneNumber,
            dateOfBirth: new Date(registerDto.dateOfBirth),
            userType: registerDto.userType || UserTypeEnum.USER,
            status: UserStatus.PENDING_VERIFICATION
        };

        const savedUser = await this.userService.saveUser(userEntity);

        // Generate 6-digit OTP
        const otpCode = GenerateOtpNumber.generateOtp();
        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + this.configService.get<number>("app.otp.expire_time", 10));

        // Save OTP to database
        await this.authRepository.createOtp({
            otpCode,
            otpType: OtpType.REGISTER,
            expireAt: expireTime,
            userId: savedUser.id,
            isUsed: false
        });

        // Send OTP via email
        await this.appMailerService.LoginOtpSend(savedUser, otpCode);

        this.#logger.debug(`${logPrefix} : User registered successfully. OTP sent to: ${registerDto.email}`);

        return new AppResponse(
            "Registration successful. Please check your email for the verification code.",
            {},
            { module: MapToModuleName(ModuleNames.USER), action: "registered" }
        );
    }


    /**
     * Verify OTP codes for login or registration processes
     */
    async otpVerify(otpVerifyDto: OtpVerifyRequestDto): Promise<AppResponse<AuthResponseDto>> {
        const logPrefix = this.otpVerify.name;

        this.#logger.debug(`${logPrefix} : Verifying OTP for email: ${otpVerifyDto.email}`);

        // Get user
        const user = await this.userService.findUserByEmail(otpVerifyDto.email);
        if (!user) {
            throw new NotFoundException({ message: "ERR_EMAIL_NOT_FOUND" });
        }

        // Get latest OTP record
        const otp = await this.authRepository.findLatestOtpByUserIdAndType(user.id, otpVerifyDto.otpType);
        if (!otp) {
            throw new NotFoundException({ message: "ERR_OTP_NOT_FOUND" });
        }

        // Validate OTP
        if (otp.otpCode !== otpVerifyDto.otp) {
            throw new NotFoundException({ message: "ERR_OTP_INVALID" });
        }

        // Check expiry
        if (otp.expireAt <= new Date()) {
            throw new NotFoundException({ message: "ERR_OTP_EXPIRED" });
        }

        // Mark OTP as used
        await this.authRepository.markOtpAsUsed(otp.id);

        if (otpVerifyDto.otpType === OtpType.REGISTER) {
            // Activate user account
            if (user.status === UserStatus.PENDING_VERIFICATION) {
                await this.userService.updateUserStatus(user.id, UserStatus.ACTIVE);
            }

            // Generate tokens
            const tokens = await this.appJwtService.generateJWTToken(user);

            // Store tokens in database
            await this.authRepository.storeLoginToken(tokens.accessToken, tokens.refreshToken, user.id);

            const response = new AuthResponseDto(user, tokens.accessToken, tokens.refreshToken, false);

            return new AppResponse(SuccessConstant.SuccessAction, response, {
                module: MapToModuleName(ModuleNames.OTP),
                action: "verified"
            });
        } else if (otpVerifyDto.otpType === OtpType.LOGIN) {
            // Generate fresh tokens
            const tokens = await this.appJwtService.generateJWTToken(user);

            // Store tokens in database
            await this.authRepository.storeLoginToken(tokens.accessToken, tokens.refreshToken, user.id);

            const response = new AuthResponseDto(user, tokens.accessToken, tokens.refreshToken, false);

            return new AppResponse(SuccessConstant.SuccessAction, response, {
                module: MapToModuleName(ModuleNames.OTP),
                action: "verified"
            });
        }

        return new AppResponse(SuccessConstant.SuccessAction, {} as AuthResponseDto, {
            module: MapToModuleName(ModuleNames.OTP),
            action: "verified"
        });
    }

    /**
     * Get remaining time before OTP expires
     */
    async getOtpLeftTime(data: OtpLeftTimeRequestDto): Promise<AppResponse<OtpLeftTimeResponseDto>> {
        const logPrefix = this.getOtpLeftTime.name;

        this.#logger.debug(`${logPrefix} : Getting OTP left time for email: ${data.email}`);

        // Get user
        const user = await this.userService.findUserByEmail(data.email);
        if (!user) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        // Get OTP expiry time
        const expireTime = await this.authRepository.getOtpExpireTime(user.id, data.otpType);
        if (!expireTime) {
            throw new NotAcceptableException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.OTP) });
        }

        // Calculate remaining time
        const now = new Date();
        const remainingTime = Math.max(0, Math.floor((expireTime.getTime() - now.getTime()) / 1000));

        const response = new OtpLeftTimeResponseDto(remainingTime);

        this.#logger.debug(`${logPrefix} : OTP expires in ${remainingTime} seconds`);

        return new AppResponse(SuccessConstant.DetailFetch, response, {
            module: MapToModuleName(ModuleNames.OTP)
        });
    }

    /**
     * Generate and send new OTP
     */
    async resendOtp(resendOtpDto: ResendOtpRequestDto): Promise<AppResponse<{}>> {
        const logPrefix = this.resendOtp.name;

        this.#logger.debug(`${logPrefix} : Resending OTP for email: ${resendOtpDto.email}`);

        // Get user
        const user = await this.userService.findUserByEmail(resendOtpDto.email);
        if (!user) {
            throw new NotFoundException({ message: "ERR_EMAIL_NOT_FOUND" });
        }

        // Generate new 6-digit OTP
        const otpCode = GenerateOtpNumber.generateOtp();
        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + this.configService.get<number>("app.otp.expire_time", 10));

        // Update or create new OTP record
        await this.authRepository.createOtp({
            otpCode,
            otpType: resendOtpDto.otpType,
            expireAt: expireTime,
            userId: user.id,
            isUsed: false
        });

        // Send OTP via email using the correct method
        this.appMailerService.forgotPasswordOtp(user, otpCode);

        this.#logger.debug(`${logPrefix} : OTP resent successfully for user: ${user.id}`);

        return new AppResponse(
            SuccessConstant.SuccessAction,
            {},
            { module: MapToModuleName(ModuleNames.OTP), action: "resent" }
        );
    }

    /**
     * Change password with old password verification
     */
    async changePassword(changePasswordDto: ChangePasswordRequestDto, user: User): Promise<AppResponse<{}>> {
        const logPrefix = this.changePassword.name;

        this.#logger.debug(`${logPrefix} : Changing password for user: ${user.id}`);

        // Fetch full user entity to get access to class methods (like validatePassword)
        const userEntity = await this.userService.findUserById(user.id);
        if (!userEntity) {
            throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: MapToModuleName(ModuleNames.USER) });
        }

        // Validate old password using entity method
        const isOldPasswordValid = await userEntity.validatePassword(changePasswordDto.oldPassword);
        if (!isOldPasswordValid) {
            throw new NotAcceptableException({ message: "ERR_CURRENT_PASSWORD_INCORRECT" });
        }

        // Update password via UserService
        await this.userService.updateUserPassword(user.id, changePasswordDto.newPassword);

        this.#logger.debug(`${logPrefix} : Password changed successfully for user: ${user.id}`);

        return new AppResponse(
            SuccessConstant.SuccessAction,
            {},
            { module: MapToModuleName(ModuleNames.PASSWORD), action: "changed" }
        );
    }

    /**
     * Initiate password reset process
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordRequestDto): Promise<AppResponse<{}>> {
        const logPrefix = this.forgotPassword.name;

        this.#logger.debug(`${logPrefix} : Initiating password reset for email: ${forgotPasswordDto.email}`);

        // Get user
        const user = await this.userService.findUserByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new NotFoundException({ message: "ERR_EMAIL_NOT_FOUND" });
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new NotAcceptableException({ message: "ERR_ACCOUNT_INACTIVE" });
        }

        // Generate new 6-digit OTP
        const otpCode = GenerateOtpNumber.generateOtp();
        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + this.configService.get<number>("app.otp.expire_time", 10));

        // Update or create new OTP record
        await this.authRepository.createOtp({
            otpCode,
            otpType: OtpType.FORGOT_PASSWORD,
            expireAt: expireTime,
            userId: user.id,
            isUsed: false
        });

        // Send OTP via email using the correct method
        this.appMailerService.forgotPasswordOtp(user, otpCode);

        this.#logger.debug(`${logPrefix} : Password reset initiated successfully for user: ${user.id}`);
        return new AppResponse(
            SuccessConstant.SuccessAction,
            {},
            { module: MapToModuleName(ModuleNames.OTP), action: "sent" }
        );
    }

    /**
     * Reset password using valid reset token
     */
    async resetPassword(resetPasswordDto: ResetPasswordRequestDto): Promise<AppResponse<{}>> {
        const logPrefix = this.resetPassword.name;

        this.#logger.debug(`${logPrefix} : Resetting password for user: ${resetPasswordDto.email}`);

        // Get user and check status
        const user = await this.userService.findUserByEmail(resetPasswordDto.email);
        if (!user) {
            throw new NotFoundException({ message: "ERR_EMAIL_NOT_FOUND" });
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new NotAcceptableException({ message: "ERR_ACCOUNT_INACTIVE" });
        }

        // Update password via UserService
        await this.userService.updateUserPassword(user.id, resetPasswordDto.newPassword);

        this.#logger.debug(`${logPrefix} : Password reset completed successfully for user: ${user.id}`);

        return new AppResponse(
            SuccessConstant.SuccessAction,
            {},
            { module: MapToModuleName(ModuleNames.PASSWORD), action: "reset" }
        );
    }
}
