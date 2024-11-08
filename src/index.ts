import { CLI, Command, Parameter } from "./parser/classes";

const args = process.argv.slice(2);

const cli = new CLI();

const greetCommand = new Command("greet", "Greets the user", params => { // TODO: Fix the any type
    const name = params["--name"] || "Stranger";
    console.log(`Hello, ${name}`);
    console.log('params', params);
});

greetCommand.addParam(new Parameter("--name", "Name of the user", "Stranger"));

cli.addCommand(greetCommand);

cli.parse(args);