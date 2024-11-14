import { Logger } from "./logger";

const logger = new Logger();

export class Flag {
    public name: string;
    public description: string;
    public defaultValue: string | null;

    constructor(name: string, description: string, defaultValue: string | null = null) {
        this.name = name;
        this.description = description;
        this.defaultValue = defaultValue;
    }
}

type ArgMap = Record<string, string | true | null | undefined>;

type Action = (params: ArgMap) => void;

export class CLI {
    public action: Action;
    public flags: Flag[] = [];
    public requiredArgs: Flag[] = [];
    
    constructor(action: Action) {
        this.action = action;
    }

    public addFlag(flag: Flag) {
        this.flags.push(flag);
        return this;
    }

    public addRequiredArg(arg: Flag) {
        this.requiredArgs.push(arg);
        return;
    } 

    public parse(args: string[]) {
        const argMap: ArgMap = {};

        let requiredArgIndex = 0;

        for (const arg of args) {
            if (!arg.startsWith("--") && requiredArgIndex < this.requiredArgs.length) {
                const argName = this.requiredArgs[requiredArgIndex].name;
                argMap[argName] = arg;
                requiredArgIndex++;
            } else {
                break;
            }
        }

        for (let i = 0; i < args.length; i++) { // Iterate through args and set arg value to the next arg, or to true if the next arg is not present or an option
            const arg = args[i];
            if (arg.startsWith("--")) {
                const currentFlag = this.flags.find(flag => flag.name === arg);

                if (currentFlag) {
                    i++;
                    const nextArg = args[i];

                    if (nextArg && !nextArg.startsWith("--")) {
                        argMap[currentFlag.name] = nextArg;
                    } else {
                        argMap[currentFlag.name] = true;
                    }
                } else {
                    logger.error(`Option not found: ${arg}`);
                    return;
                }
            }
        }

        this.action(argMap);
    }

    public help() {
        
    }
}