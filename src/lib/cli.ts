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

export class Command {
    public name: string;
    public description: string;
    public action: Action;
    public flags: Flag[] = [];
    public requiredArgs: Flag[] = [];

    constructor(name: string, description: string, action: Action) {
        this.name = name;
        this.description = description;
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
}

export class CLI {
    private commands: Command[];
    
    constructor() {
        this.commands = [];
    }

    public addCommand(command: Command) {
        this.commands.push(command);
        return this;
    }

    public parse(args: string[]) {
        const [commandName, ...restArgs] = args;
        const command = this.commands.find(cmd => cmd.name === commandName);

        if (!command) {
            console.error(`Unknown command: ${command}`); // TODO: Add custom logger here
            return;
        }

        const argMap: ArgMap = {};

        let requiredArgIndex = 0;

        for (const arg of restArgs) {
            if (!arg.startsWith("--") && requiredArgIndex < command.requiredArgs.length) {
                const argName = command.requiredArgs[requiredArgIndex].name;
                argMap[argName] = arg;
                requiredArgIndex++;
            } else {
                break;
            }
        }

        for (let i = 0; i < restArgs.length; i++) { // Iterate through args and set arg value to the next arg, or to true if the next arg is not present or an option
            const arg = restArgs[i];
            if (arg.startsWith("--")) {
                const currentFlag = command.flags.find(flag => flag.name === arg);

                if (currentFlag) {
                    i++;
                    const nextArg = restArgs[i];

                    if (nextArg && !nextArg.startsWith("--")) {
                        argMap[currentFlag.name] = nextArg;
                    } else {
                        argMap[currentFlag.name] = true;
                    }
                } else {
                    console.error(`Option not found: ${arg}`); // TODO: Add custom logger here
                    return;
                }
            }
        }

        command.action(argMap);
    }
}