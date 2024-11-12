import { resolve } from "path";
import { CLI, Command, Flag } from "./lib/cli";
import { promises } from "fs";
import { csvToJson } from "./lib/csvToJson";
import { writeFile } from "fs/promises";
import { Logger } from "./lib/logger";

const args = process.argv.slice(2);

const cli = new CLI();

const logger = new Logger();

const greetCommand = new Command("greet", "Greets the user", params => {
    const name = params["name"] || "Stranger";
    logger.info(`Hello, ${name}`);
});

greetCommand.addRequiredArg(new Flag("name", "Name of the user", "Stranger"));

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
            process.stdin.on("error", () => logger.error("Failed to handle passed data"));
        });
        } else {
            logger.error("No data or path provided");
            return;
        }

    const json = csvToJson(data);

    const savePath = params["savePath"];
    if (savePath) {
        if (typeof savePath === "boolean") {
            logger.error("Something ain't right chief, save path cannot be a boolean");
            return json;
        }
        
        await writeFile(savePath, json);
    }

    const shouldLog = params["--log"];

    if (shouldLog) {
        console.log(json);
    }

    return json;
});

csvConverterCommand.addRequiredArg(new Flag("path", "Path to csv file"));
csvConverterCommand.addRequiredArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverterCommand.addFlag(new Flag("--log", "Flag to log the converted json out"));

cli.addCommand(csvConverterCommand);

cli.parse(args);