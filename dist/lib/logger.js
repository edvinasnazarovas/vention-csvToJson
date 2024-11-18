"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const promises_1 = require("fs/promises");
var Level;
(function (Level) {
    Level["info"] = "INFO";
    Level["warn"] = "WARN";
    Level["error"] = "ERROR";
})(Level || (Level = {}));
var Colors;
(function (Colors) {
    Colors["red"] = "\u001B[31m";
    Colors["green"] = "\u001B[32m";
    Colors["yellow"] = "\u001B[33m";
    Colors["blue"] = "\u001B[34m";
    Colors["magenta"] = "\u001B[35m";
    Colors["cyan"] = "\u001B[36m";
    Colors["white"] = "\u001B[37m";
    Colors["bold"] = "\u001B[1m";
    Colors["underline"] = "\u001B[4m";
    Colors["reset"] = "\u001B[0m";
})(Colors || (Colors = {}));
class Logger {
    options = {
        colors: {
            INFO: Colors.white,
            WARN: Colors.yellow,
            ERROR: Colors.red
        }
    };
    colorize(message, color) {
        return `${color}${message}${Colors.reset}`;
    }
    log(message, level) {
        console.log(level ? `| ${this.colorize(level, this.options.colors[level])} | ${message}` : message);
    }
    async logToFile(message, path, level) {
        await (0, promises_1.writeFile)(path, level ? `| ${this.colorize(level, this.options.colors[level])} | ${message}` : message);
    }
    info(message, options) {
        this.log(message, Level.info);
    }
    warn(message, options) {
        this.log(message, Level.warn);
    }
    error(message, options) {
        this.log(message, Level.error);
    }
}
exports.Logger = Logger;
