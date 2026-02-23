export function GenerateLogPrefix(functionName: string, requestId?: string): string {
    const logPrefix: string[] = [functionName];

    if (requestId) {
        logPrefix.push(" - ");
        logPrefix.push(requestId);
    }

    logPrefix.push(" -");

    return logPrefix.join("");
}

export function GenerateLoggingPrefix(functionName: string, requestId?: string) {
    return {
        logPrefix: GenerateLogPrefix(functionName, requestId)
    };
}
