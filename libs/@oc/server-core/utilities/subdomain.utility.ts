import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Validates a subdomain string.
 * Rules:
 * - Must not be divided by "." (single level)
 * - Must not be empty
 * - Should be URL-safe: start/end with alphanumeric, can contain hyphens.
 * @param subdomain - Subdomain string to validate
 * @returns boolean - True if valid
 */
export const ValidateSubdomain = (subdomain: string): boolean => {
    if (!subdomain || typeof subdomain !== "string") return false;

    // Rule: Must not contain dots
    if (subdomain.includes(".")) return false;

    // Regex: alphanumeric start/end, hyphens allowed in middle. 1-63 chars.
    // Case insensitive.
    const validRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

    return validRegex.test(subdomain);
};

/**
 * Service for handling subdomain extraction and validation.
 */
@Injectable()
export class SubdomainUtility {
    constructor(private readonly configService: ConfigService) {}

    /**
     * Extract subdomain from origin or host header
     * @param originOrHost - The origin (e.g., http://demo.anvixengine.com) or host (e.g., demo.anvixengine.com)
     * @returns The subdomain string or null if not found
     */
    extractSubdomain(originOrHost: string): string | null {
        if (!originOrHost || typeof originOrHost !== "string") return null;

        // Remove protocol and trailing paths/slash
        let base = originOrHost.replace(/^https?:\/\//, "").split("/")[0];

        // Remove port if present
        base = base.split(":")[0];

        // Localhost logic: bypass main domain check for local dev
        // Matches domains ending in "localhost" or straight IP "127.0.0.1" (though usually IPs don't have subdomains in this context)
        if (base.endsWith("localhost")) {
            const parts = base.split(".");
            if (parts.length > 1 && parts[0] !== "localhost") {
                return parts[0];
            }
            return null;
        }

        // Use NestJS ConfigService for main domain (best practice)
        const mainDomain = this.configService.get<string>("MAIN_DOMAIN");

        // Validate mainDomain: must be a non-empty string
        if (mainDomain && typeof mainDomain === "string" && mainDomain.trim()) {
            // Ensure suffix starts with dot
            const domainSuffix = mainDomain.startsWith(".") ? mainDomain : `.${mainDomain}`;

            if (base.endsWith(domainSuffix)) {
                const subdomain = base.slice(0, -domainSuffix.length);

                // Validate the extracted subdomain using the common validator
                if (!ValidateSubdomain(subdomain)) {
                    return null;
                }

                return subdomain;
            }
            // If main domain is configured but doesn't match host, return null
            return null;
        }

        // Fallback Logic when MAIN_DOMAIN is not set
        // Heuristic: take the first part if there are more than 2 parts (e.g., sub.domain.com)
        const parts = base.split(".");
        if (parts.length > 2) {
            return parts[0];
        }

        return null;
    }
}
