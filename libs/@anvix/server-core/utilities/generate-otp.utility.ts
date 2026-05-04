export class GenerateOtpNumber {
    static generateOtp() {
        /**
         * Generate otp without library
         */
        const otp = Math.floor(Math.random() * 899999 + 100000);
        return otp.toString();
    }
}
