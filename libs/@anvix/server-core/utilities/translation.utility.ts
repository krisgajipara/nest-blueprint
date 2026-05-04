import { TranslationFile } from "@core-enums";
import * as errorEn from "./i18n/en/error.json";
import * as successEn from "./i18n/en/success.json";

export class Translation {
    private static readonly translationCache: { [key: string]: any } = {
        en: {
            [TranslationFile.Error]: errorEn,
            [TranslationFile.Success]: successEn
        }
    };

    static Translator(lang: string, file: TranslationFile, variable: string, parameters: { toString(): string } = {}) {
        const language = lang.toLowerCase() || "en";

        // Get translation data from cache or fallback to English
        const jsonData = this.translationCache[language]?.[file] || this.translationCache["en"]?.[file];

        if (!jsonData) {
            // Fallback to variable name if file is not found
            return variable;
        }

        const msgData = jsonData[variable];

        if (!msgData) {
            // Fallback to variable name if message data is not found
            return variable;
        }

        function renderString(msg: string, object) {
            return (
                msg.match(/\{(.*?)\}/gi)?.reduce((acc, binding) => {
                    const property = binding.substring(1, binding.length - 1);
                    const str = acc == "" || acc == null ? msg : acc;
                    return `${str.replace(/\{(.*?)\}/, object[property])}`;
                }, "") || msg
            );
        }

        if (msgData && typeof msgData === "string" && msgData.match(/\{(.*?)\}/gi)) {
            return renderString(msgData, parameters);
        } else {
            return msgData;
        }
    }
}
