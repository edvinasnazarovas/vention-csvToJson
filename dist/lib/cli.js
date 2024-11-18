"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.Flag = void 0;
const logger_1 = require("./logger");
const logger = new logger_1.Logger();
class Flag {
    name;
    description;
    defaultValue;
    constructor(name, description, defaultValue = null) {
        this.name = name;
        this.description = description;
        this.defaultValue = defaultValue;
    }
}
exports.Flag = Flag;
class CLI {
    action;
    flags = [];
    requiredArgs = [];
    description;
    constructor(description, action) {
        this.description = description;
        this.action = action;
    }
    addFlag(flag) {
        this.flags.push(flag);
        return this;
    }
    addArg(arg) {
        this.requiredArgs.push(arg);
        return;
    }
    parse(args) {
        const argMap = {};
        let requiredArgIndex = 0;
        for (const arg of args) {
            if (!arg.startsWith("--") && requiredArgIndex < this.requiredArgs.length) {
                const argName = this.requiredArgs[requiredArgIndex].name;
                argMap[argName] = arg;
                requiredArgIndex++;
            }
            else {
                break;
            }
        }
        for (let i = 0; i < args.length; i++) { // Iterate through args and set arg value to the next arg, or to true if the next arg is not present or an option
            const arg = args[i];
            if (arg.startsWith("--")) {
                if (arg === "--help") {
                    this.help();
                    continue;
                }
                const currentFlag = this.flags.find(flag => flag.name === arg);
                if (currentFlag) {
                    i++;
                    const nextArg = args[i];
                    if (nextArg && !nextArg.startsWith("--")) {
                        argMap[currentFlag.name] = nextArg;
                    }
                    else {
                        argMap[currentFlag.name] = true;
                    }
                }
                else {
                    logger.error(`Option not found: ${arg}`);
                    return;
                }
            }
        }
        this.action(argMap);
    }
    help() {
        logger.log(`Description: ${this.description}\n`);
        logger.log("List of arguments:");
        for (let i = 0; i < this.requiredArgs.length; i++) {
            logger.log(`${i}. ${this.requiredArgs[i].name}     ${this.requiredArgs[i].description}`);
        }
        logger.log("\nList of flags:");
        for (const flag of this.flags) {
            logger.log(`${flag.name}     ${flag.description}`);
        }
    }
}
exports.CLI = CLI;
