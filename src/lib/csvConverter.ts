import { CLI, Flag } from "../lib/cli";
import { AppError} from "../lib/error";
import { Logger } from "../lib/logger";
import { readJsonRows} from "../db/db";
import { CsvParser } from "./csvToJson";

const logger = new Logger();

export function handleOptions(options: any) {
    if (options.readDb) {
        const rows = readJsonRows();
        logger.log(JSON.stringify(rows));
    }
}

export const csvConverter = new CLI("Converts csv data to json", async (params) => {
    const parser = new CsvParser();

    const path = params["path"];
    const savePath = params["savePath"];

    const readDb = params["--readDb"];

    const options = {
        log: params["--log"] === true,
        saveToDb: params["--db"] === true,
    };

    if (typeof options.log !== "boolean" || typeof options.saveToDb !== "boolean") {
        AppError.fatal("Invalid flags");
    }

    handleOptions({readDb});

    if (path && typeof path === "string") {
        if (!savePath || typeof savePath === "string") {
            await parser.processFile(path, savePath, options);
        }
    } else if (!path) {
        await parser.processStdin();
    } else {
        AppError.fatal("No data or path provided");
    }
});

csvConverter.addArg(new Flag("path", "Path to csv file"));
csvConverter.addArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverter.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverter.addFlag(new Flag("--db", "Flag to save the output to the database"));
csvConverter.addFlag(new Flag("--readDb", "Flag to read json rows from the database"));
csvConverter.addFlag(new Flag("--d", "Specify csv delimeter"));