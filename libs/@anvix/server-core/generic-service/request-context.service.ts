import { Injectable } from "@nestjs/common";

@Injectable()
export class RequestContextService {
    //#region Setting Language for the use of i18n in services, mainly used in custom-validators
    private language: string;

    public setLanguage(lang: string): void {
        this.language = lang.toLowerCase();
    }

    public getLanguage(): string {
        return this.language;
    }
    //#endregion

    //#region Setting User ID for the use of user context in services
    private userId: string;

    setUserId(userId: string) {
        this.userId = userId;
    }

    getUserId(): string {
        return this.userId;
    }
    //#endregion
}
