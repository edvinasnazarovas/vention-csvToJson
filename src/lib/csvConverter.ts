import { CLI, Flag } from "../lib/cli";
import { ErrorHandler } from "../lib/error";
import { Logger } from "../lib/logger";
import { csvToJsonLine, processFile } from "../lib/csvToJson";
import { readJsonRows} from "../db/db";
import { Transform } from "stream";

const error = new ErrorHandler();

const logger = new Logger();

export function handleOptions(options: any) {
    if (options.readDb) {
        const rows = readJsonRows();
        logger.log(JSON.stringify(rows));
    }
}

export async function processStdin(delimiter: string, options: any) {
    let headers: string[] = [];
    let lineBuffer = "";

    const transformStream = new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
    });

    transformStream._transform = function (chunk, encoding, callback) {
        lineBuffer += chunk.toString();
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() || "";

        for (const line of lines) {
            if (!headers.length) {
                headers = line.split(delimiter);
            } else {
                const json = csvToJsonLine(headers, line);
                this.push(JSON.stringify(json) + "\n");
            }
        }
        callback();
    };

    transformStream._flush = function (callback) {
        if (lineBuffer && headers.length) {
            const json = csvToJsonLine(headers, lineBuffer);
            this.push(JSON.stringify(json) + "\n");
        }
        callback();
    };

    await new Promise((resolve, reject) => {
        process.stdin
            .pipe(transformStream)
            .pipe(process.stdout)
            .on("end", resolve)
            .on("error", (error) => {
                logger.error("Failed to handle passed data: " + error.message);
                reject(error);
            });
    });
}

export const csvConverter = new CLI("Converts csv data to json", async (params) => {
    const path = params["path"];
    const savePath = params["savePath"];
    const delimiter = typeof params["--d"] === "string" ? params["--d"] : ",";

    const options = {
        log: params["--log"],
        saveToDb: params["--db"],
        readDb: params["--readDb"],
        isFirstLine: true,
    };

    handleOptions(options);

    if (path && typeof path === "string") {
        if (!savePath || typeof savePath === "string") {
            await processFile(path, delimiter, savePath, options);
        }
    } else if (!path) {
        await processStdin(delimiter, options);
    } else {
        error.fatal("No data or path provided");
    }
});

csvConverter.addArg(new Flag("path", "Path to csv file"));
csvConverter.addArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverter.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverter.addFlag(new Flag("--db", "Flag to save the output to the database"));
csvConverter.addFlag(new Flag("--readDb", "Flag to read json rows from the database"));
csvConverter.addFlag(new Flag("--d", "Specify csv delimeter"));