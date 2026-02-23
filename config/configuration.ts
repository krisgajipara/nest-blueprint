export const configuration = () => {
    // Log loaded environment variables for debugging
    console.log("Environment Configuration Loaded:");

    const config = {
        server: {
            env: process.env.NODE_ENV,
            port: parseInt(process.env.SERVER_PORT),
            origin: JSON.parse(process.env.WHITELIST)
        },

        db: {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME,
            synchronize: process.env.DATABASE_SYNC == "true",
            logging: process.env.DATABASE_LOG == "true",
            cache: process.env.DATABASE_CACHE == "true"
        },

        jwt: {
            expire_in: process.env.JWT_EXPIRE_IN,
            expire_in_remember_me: process.env.JWT_EXPIRE_IN_REMEMBER_ME,
            secret: process.env.JWT_SECRET_KEY
        },

        refresh_token: {
            expire_in: process.env.REFRESH_TOKEN_EXPIRE_IN,
            expire_in_remember_me: process.env.REFRESH_TOKEN_EXPIRE_IN_REMEMBER_ME,
            secret: process.env.REFRESH_TOKEN_SECRET_KEY
        },

        cookie_secret: {
            secret: process.env.COOKIE_SECRET
        },

        email: {
            host: process.env.EMAIL_HOST || "localhost",
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            port: parseInt(process.env.EMAIL_PORT) || 3000,
            secure: process.env.EMAIL_SECURE == "true",
            support_email: process.env.SUPPORT_EMAIL,
            academy_name: process.env.ACADEMY_NAME,
            academy_website: process.env.ACADEMY_WEBSITE
        },

        aws_s3: {
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            private_bucket_name: process.env.AWS_PRIVATE_BUCKET_NAME,
            region: process.env.AWS_REGION
        },

        app: {
            forgot_password_email_valid_till: parseInt(process.env.FORGOT_PASSWORD_EMAIL_VALID_TILL), // in minutes
            doc_url: process.env.DOC_URL,
            frontend_base_url: process.env.FRONTEND_BASE_URL,
            admin_base_url: process.env.ADMIN_BASE_URL,
            otp: {
                expire_time: parseInt(process.env.OTP_EXPIRE_TIME),
                enabled: process.env.OTP_ENABLED == "true"
            }
        },
        stripe: {
            secret_key: process.env.STRIPE_SECRET_KEY
        },
        fcm: {
            server_key: process.env.FCM_SERVER_KEY
        },

        twilio: {
            twilio_account_sid: process.env.TWILIO_ACCOUNTSID,
            twilio_apikey: process.env.TWILIO_APIKEY,
            twilio_api_secret: process.env.TWILIO_APISECRET,
            twilio_phone_number: process.env.TWILIO_PHONE_NUMBER
        },
        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
            traces_sample_rate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
            profiles_sample_rate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
            enabled: process.env.SENTRY_ENABLED === "true"
        },
        tenant: {
            main_domain: process.env.MAIN_DOMAIN
        }
    };

    console.log("Environment configuration loaded successfully\n");
    console.log("=====================================");

    return config;
};
