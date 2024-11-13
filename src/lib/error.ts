import { Logger } from "./logger";

const logger = new Logger();

class ErrorMessage {
    message: string;
    error?: string;
    code?: string;

    constructor(message: string, error?: string, code?: string) {
        this.message = message;
        this.error = error;
        this.code = code;
    }
}

interface Options {
    onFatal: (message: ErrorMessage) => void;
}

export class ErrorHandler {
    private options: Options = {
        onFatal: (message) => {logger.error(message.message); process.exit(1)}
    };

    constructor(options?: Options) {
        this.options = {...this.options, ...options};
    }

    fatal(message: string, error?: string, code?: string) {
        this.options.onFatal(new ErrorMessage(message, error, code));
    }
}