import * as dotenv from 'dotenv';
dotenv.config();

import { resolve } from "path";
import { CLI, Command, Flag } from "./lib/cli";
import { createReadStream, createWriteStream, promises} from "fs";
import { csvToJson, csvToJsonLine } from "./lib/csvToJson";
import { Logger } from "./lib/logger";
import { ErrorHandler } from "./lib/error";
import { saveJsonToDb } from "./lib/db";

const args = process.argv.slice(2);

const cli = new CLI();

const logger = new Logger();

const error = new ErrorHandler();

const csvConverterCommand = new Command("csvToJson", "Converts csv to json", async params => {
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

                readStream.on("data", chunk => {
                    lineBuffer += chunk;

                    const lines = lineBuffer.split("\n");

                    lineBuffer = lines.pop() || "";

                    lines.forEach(async line => {
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
                                console.log('saving to db');
                                await saveJsonToDb(json)
                            } else {
                                console.log("Not saving to db")
                            }
                        }
                    });
                });

                readStream.on("end", () => {
                    if (lineBuffer) {
                        const jsonObject = csvToJsonLine(headers || [], lineBuffer);
                        if (!isFirstLine) writeStream.write(delimiter);
                        writeStream.write(JSON.stringify(jsonObject, null, 2));
                    }

                    writeStream.write("]");
                    writeStream.end();
                });

                readStream.on('error', (error) => {
                    logger.error(`An error occurred while reading the file: ${error.message}`);
                });
                // await logger.logToFile(json, savePath);
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

csvConverterCommand.addRequiredArg(new Flag("path", "Path to csv file"));
csvConverterCommand.addRequiredArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverterCommand.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverterCommand.addFlag(new Flag("--db", "Flag to save the output to a database"));

cli.addCommand(csvConverterCommand);

const testCommand = new Command("test", "test command", async (params) => {
    console.log('o hallo')

    await saveJsonToDb(`[{"test":"test"}]`);
});

cli.addCommand(testCommand);

cli.parse(args);