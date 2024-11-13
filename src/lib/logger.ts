import { writeFile } from "fs/promises";

enum Level {
    info="INFO",
    warn="WARN",
    error="ERROR"
}

enum Colors {
    red="\x1b[31m",
    green="\x1b[32m",
    yellow="\x1b[33m",
    blue="\x1b[34m",
    magenta="\x1b[35m",
    cyan="\x1b[36m",
    white="\x1b[37m",
    bold="\x1b[1m",
    underline="\x1b[4m",
    reset="\x1b[0m"
}

interface Options {
    colors: Record<Level, Colors>
}

interface LogOptions {
    saveToFile?: boolean
}

export class Logger {
    options: Options = {
        colors: {
            INFO: Colors.white,
            WARN: Colors.yellow,
            ERROR: Colors.red
        }
    }

    private colorize(message: string, color: Colors) {
        return `${color}${message}${Colors.reset}`;
    }

    log(message: string, level?: Level) {
        console.log(level ? `| ${this.colorize(level, this.options.colors[level])} | ${message}` : message);
    }

    async logToFile(message: string, path: string, level?: Level) {
        await writeFile(path, level ? `| ${this.colorize(level, this.options.colors[level])} | ${message}`: message);
    }

    info(message: string, options?: LogOptions) {
        this.log(message, Level.info);
    }

    warn(message: string, options?: LogOptions) {
        this.log(message, Level.warn);
    }

    error(message: string, options?: LogOptions) {
        this.log(message, Level.error);
    }
}