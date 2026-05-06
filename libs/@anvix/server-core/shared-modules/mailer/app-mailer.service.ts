import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Mailer Service for sending emails
 * Handles all email templates and sending operations
 */
@Injectable()
export class AppMailerService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    // Send verify email to user email address
    async VerifyEmailOtpSend(user, otp) {
        await this.mailerService.sendMail({
            template: "./verify-email",
            context: {
                otp: otp
            },
            subject: `OTP - Email verification`,
            to: user.email
        });
    }

    // Send login otp to user email address
    async LoginOtpSend(user, otp) {
        await this.mailerService.sendMail({
            template: "./login-otp",
            context: {
                otp: otp
            },
            subject: `OTP - Login verification`,
            to: user.email
        });
    }

    // resend email based on otp types REGISTER = 1, LOGIN = 2, FORGOT_PASSWORD = 3
    async forgotPasswordOtp(user, otp): Promise<void> {
        const validity_minutes = this.configService.get("OTP_EXPIRE_TIME");
        const support_email = this.configService.get("email.support_email");
        const academy_name = this.configService.get("email.academy_name");
        const academy_website = this.configService.get("email.academy_website");

        const context = {
            user_name: `${user.firstName} ${user.lastName}`,
            otp_code: otp,
            otp_validity_minutes: validity_minutes,
            support_email: support_email,
            academy_name: academy_name,
            academy_website: academy_website
        };
        await this.mailerService.sendMail({
            template: "./forgot-password",
            context: context,
            subject: `Your One-Time Password (OTP)`,
            to: user.email
        });
    }

    // Send reset password email to user
    async ResetPasswordLink(resetLink, user) {
        await this.mailerService.sendMail({
            template: "./reset-password-link",
            context: {
                resetLink: resetLink
            },
            subject: `Reset Forgot Password Link`,
            to: user.email
        });
    }

    // Resend password link to user
    async ResendPasswordLink(resetLink, user) {
        await this.mailerService.sendMail({
            template: "./reset-password-link",
            context: {
                resetLink: resetLink
            },
            subject: `Resend Forgot Password Link`,
            to: user.email
        });
    }


    // Send student onboarding email
    async sendUserOnboardingEmail(userData) {
        await this.mailerService.sendMail({
            template: "./user-onboarding",
            context: {
                userName: `${userData.firstName} ${userData.lastName}`,
                startDate: userData.startDate
                    ? new Date(userData.startDate).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                senderName: "Admin"
            },
            subject: `Welcome to Our Platform`,
            to: userData.email
        });
    }

}
