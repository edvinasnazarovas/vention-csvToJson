import { Logger } from "./logger";

const logger = new Logger();

export class AppError extends Error {
    constructor(message: string, public error?: string, public code?: string, isOperational: boolean = true) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.name = "App Error";
        logger.error(`${message}${error ? `: ${error}` : ""}${code ? ` (Code: ${code})` : ""}`);
    }

    static fatal(message: string, error?: string, code?: string): never {
        logger.error(`${message}${error ? `: ${error}` : ""}${code ? ` (Code: ${code})` : ""}`);
        throw new AppError(message, error, code, false);
    }
}