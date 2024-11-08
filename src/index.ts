import { resolve } from "path";
import { CLI, Command, Flag } from "./utils/cli";
import { promises } from "fs";
import { csvToJson } from "./utils/csvToJson";

const args = process.argv.slice(2);

const cli = new CLI();

const greetCommand = new Command("greet", "Greets the user", params => {
    const name = params["--name"] || "Stranger";
    console.log(`Hello, ${name}\nHere is your provided pathname: ${params["path"]}`);
});

greetCommand.addFlag(new Flag("--name", "Name of the user", "Stranger"));

greetCommand.addRequiredArg(new Flag("path", "Pathname", null));

cli.addCommand(greetCommand);

const csvConverterCommand = new Command("csvToJson", "Converts csv to json", async params => {
    const path = params["path"];
    let data = "";

    if (path && typeof path === "string") {
        data = await promises.readFile(resolve(path), "utf8");
    } else if (!path) {
        await new Promise((resolve, reject) => {
            process.stdin.on("data", chunk => data += chunk);
            process.stdin.on("end", () => resolve(void(0)));
            process.stdin.on("error", () => console.error("Failed to handle passed data")); // TODO: Add custom logger here
        });
        } else {
            console.error("No data or path provided") // TODO: Add custom logger here
            return;
        }

    const json = csvToJson(data);

    console.log(json);

    return json;
});

csvConverterCommand.addRequiredArg(new Flag("path", "Path to csv file"));

cli.addCommand(csvConverterCommand);

cli.parse(args);