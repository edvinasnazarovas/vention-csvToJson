export class Parameter {
    public flag: string;
    public description: string;
    public defaultValue: string | null;

    constructor(flag: string, description: string, defaultValue: string | null = null) {
        this.flag = flag;
        this.description = description;
        this.defaultValue = defaultValue;
    }
}

type ArgMap = Record<string, string | null | undefined>;

type Action = (options: ArgMap) => void;

export class Command {
    public name: string;
    public description: string;
    public action: Action;
    public params: Parameter[] = [];

    constructor(name: string, description: string, action: Action) {
        this.name = name;
        this.description = description;
        this.action = action;
    }

    public addParam(param: Parameter) {
        this.params.push(param);
        return this;
    }
}

export class CLI {
    private commands: Command[];
    
    constructor() {
        this.commands = [];
    }

    addCommand(command: Command) {
        this.commands.push(command);
        return this;
    }

    parse(args: string[]) {
        const [commandName, ...restArgs] = args;
        const command = this.commands.find(cmd => cmd.name === commandName);

        if (!command) {
            console.error(`Unknown command: ${command}`); // TODO: Add custom logger here
            return;
        }

        const argMap: ArgMap = {};

        restArgs.forEach(arg => {
            console.log("got this arg", arg);
            if (arg.startsWith("--")) {
                let currentOption = command.params.find(param => param.flag === arg);
                if (currentOption) {
                    argMap[currentOption.flag] = arg;
                } else {
                    console.error(`Incorrect option: ${arg}`); // TODO: Add custom logger here
                    return;
                }
            }
        });

        command.action(argMap);
    }
}