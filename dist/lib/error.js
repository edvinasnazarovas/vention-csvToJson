"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = require("./logger");
const logger = new logger_1.Logger();
class ErrorMessage {
    message;
    error;
    code;
    constructor(message, error, code) {
        this.message = message;
        this.error = error;
        this.code = code;
    }
}
class ErrorHandler {
    options = {
        onFatal: (message) => { logger.error(message.message); process.exit(1); }
    };
    constructor(options) {
        this.options = { ...this.options, ...options };
    }
    fatal(message, error, code) {
        this.options.onFatal(new ErrorMessage(message, error, code));
    }
}
exports.ErrorHandler = ErrorHandler;
