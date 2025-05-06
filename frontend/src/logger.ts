const shouldLog = import.meta.env.DEV;

export const logger = {
    info: (message: string, ...args: unknown[]) => {
        if (shouldLog) console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: unknown[]) => {
        if (shouldLog) console.debug(`[DEBUG] ${message}`, ...args);
    }
};
