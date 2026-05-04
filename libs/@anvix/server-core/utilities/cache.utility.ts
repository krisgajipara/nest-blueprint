import { createHash } from "crypto";

export const GetCacheKey = (module: string, key: string, isList: boolean = false, filters?: any) => {
    if (isList && filters) {
        const filtersString = JSON.stringify(filters);
        const hash = createHash("md5").update(filtersString).digest("hex");
        return `${module}-${key}-${hash}`;
    }
    return `${module}-${key}`;
};
