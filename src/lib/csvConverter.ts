import { createReadStream, createWriteStream } from "fs";
import { CLI, Flag } from "../lib/cli";
import { ErrorHandler } from "../lib/error";
import { Logger } from "../lib/logger";
import { csvToJsonLine } from "../lib/csvToJson";
import { saveJsonToDatabase } from "../db/db";

const error = new ErrorHandler();

const logger = new Logger();

export const csvConverter = new CLI(async params => {
    const path = params["path"];
    const delimiter = ","; 
    let data = "";

    if (path && typeof path === "string") {
        try {
            const savePath = params["savePath"];

            if (savePath) {
                if (typeof savePath === "boolean") {
                    logger.error("Something ain't right chief, save path cannot be a boolean");
                    return;
                }

                let headers: string[] | null = null;
                let lineBuffer = "";

                const readStream = createReadStream(path);
                const writeStream = createWriteStream(savePath);

                writeStream.write("[");

                let isFirstLine = true;

                const processLine = (line: string) => {
                    if (!headers) {
                        headers = line.split(delimiter);
                    } else {
                        const jsonObject = csvToJsonLine(headers, line);

                        if (!isFirstLine) {
                            writeStream.write(delimiter);
                        } else {
                            isFirstLine = false;
                        }

                        const json = JSON.stringify(jsonObject, null, 2);
                        writeStream.write(json);

                        const shouldLog = params["--log"];
                        if (shouldLog) {
                            logger.log(json);
                        }

                        const shouldSaveToDb = params["--db"];
                        if (shouldSaveToDb) {
                            saveJsonToDatabase(json);
                        } else {
                            console.log("Not saving to db");
                        }
                    }
                };

                readStream.on("data", chunk => {
                    lineBuffer += chunk;
                
                    const lines = lineBuffer.split("\n");
                    lineBuffer = lines.pop() || "";

                    // Process each complete line
                    for (const line of lines) {
                        processLine(line);
                    }
                });

                readStream.on("end", () => {
                    if (lineBuffer) {
                        processLine(lineBuffer);
                    }

                    writeStream.write("]");
                    writeStream.end();
                });

                readStream.on('error', (error) => {
                    logger.error(`An error occurred while reading the file: ${error.message}`);
                });
            }

        } catch (err: any) {
            logger.error(`Failed to read json file: ${err.message}`);
        }
    } else if (!path) {
        await new Promise((resolve, reject) => {
            process.stdin.on("data", chunk => data += chunk);
            process.stdin.on("end", () => resolve(void(0)));
            process.stdin.on("error", () => logger.error("Failed to handle passed data"));
        });
    } else {
        error.fatal("No data or path provided")
    }
});

csvConverter.addRequiredArg(new Flag("path", "Path to csv file"));
csvConverter.addRequiredArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverter.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverter.addFlag(new Flag("--db", "Flag to save the output to a database"));