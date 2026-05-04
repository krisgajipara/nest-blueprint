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

    // Send pending fee reminder email
    async sendPendingFeeReminder(userPlanData) {
        const academy_name = this.configService.get("email.academy_name");
        const contact_number = this.configService.get("email.contact_number");

        const context = {
            recipient_name: `${userPlanData.user.firstName} ${userPlanData.user.lastName}`,
            month_or_package: userPlanData.plan?.name || "Package",
            due_date: userPlanData.endDate ? new Date(userPlanData.endDate).toLocaleDateString() : "N/A",
            amount: userPlanData.customAmount || "N/A",
            sender_name: "Academy Admin",
            sender_role: "Academy Admin",
            academy_name: academy_name,
            contact_number: contact_number
        };

        await this.mailerService.sendMail({
            template: "./pending-fee-reminder",
            context: context,
            subject: `Gentle Reminder – Pending Fee Payment`,
            to: userPlanData.user.email
        });
    }

    // Send student onboarding email
    async sendUserOnboardingEmail(userData) {
        const context = {
            userName: `${userData.firstName} ${userData.lastName}`,
            startDate: userData.startDate
                ? new Date(userData.startDate).toLocaleDateString()
                : new Date().toLocaleDateString(),
            senderName: "Admin"
        };
        await this.mailerService.sendMail({
            template: "./user-onboarding",
            context: context,
            subject: `Welcome to Our Platform`,
            to: userData.email
        });
    }

    // Send absence justification email
    async sendAbsenceJustificationEmail(absenceData) {
        const context = {
            studentName: absenceData.studentName,
            absenceDays: absenceData.absenceDays,
            academyOwnerName: absenceData.academyOwnerName,
            parentName: absenceData.parentName,
            studentId: absenceData.studentId,
            batchName: absenceData.batchName,
            timeSlot: absenceData.timeSlot,
            coachName: absenceData.coachName,
            startDate: absenceData.startDate,
            endDate: absenceData.endDate,
            absenceReason: absenceData.absenceReason,
            senderName: absenceData.senderName,
            senderRole: absenceData.senderRole
        };

        await this.mailerService.sendMail({
            template: "./absence-justification",
            context: context,
            subject: `Absence Justification – ${absenceData.studentName} (${absenceData.absenceDays} Days)`,
            to: absenceData.parentEmail,
            cc: absenceData.adminEmail
        });
    }
}
