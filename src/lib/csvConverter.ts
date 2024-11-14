import { createReadStream, createWriteStream, WriteStream } from "fs";
import { CLI, Flag } from "../lib/cli";
import { ErrorHandler } from "../lib/error";
import { Logger } from "../lib/logger";
import { csvToJsonLine } from "../lib/csvToJson";
import { readJsonRows, saveJsonToDatabase } from "../db/db";
import { Transform } from "stream";

const error = new ErrorHandler();

const logger = new Logger();

export const csvConverter = new CLI("Converts csv data to json", async params => {
    const path = params["path"];
    const delimiter = typeof params["--d"] === "string" && params["--d"] || ","; // add flag

    if (params["--readDb"]) {
        logger.log(JSON.stringify(readJsonRows()));
    }

    if (path && typeof path === "string") {
        try {
            const readStream = createReadStream(path);

            const savePath = params["savePath"];

            let writeStream: WriteStream | undefined = undefined;

            if (savePath) {

            if (typeof savePath === "boolean") {
                    logger.error("Something ain't right chief, save path cannot be a boolean");
                    return;
                }

                writeStream = createWriteStream(savePath);
            }

                let headers: string[] | null = null;
                let lineBuffer = "";

                if (writeStream) {
                    writeStream.write("[");
                }

                let isFirstLine = true;

                const processLine = (line: string) => {
                    if (!headers) {
                        headers = line.split(delimiter);
                    } else {
                        const jsonObject = csvToJsonLine(headers, line);
                        const json = JSON.stringify(jsonObject, null, 2);
                
                        if (writeStream) {
                            if (!isFirstLine) {
                                writeStream.write(delimiter);
                            } else {
                                isFirstLine = false;
                            }
                            writeStream.write(json);
                        }
                
                        const shouldLog = params["--log"];
                        if (shouldLog) {
                            logger.log(json);
                        }
                
                        const shouldSaveToDb = params["--db"];
                        if (shouldSaveToDb) {
                            saveJsonToDatabase(json);
                        }
                
                        const shouldReadFromDb = params["--readDb"];
                        if (shouldReadFromDb) {
                            logger.log(JSON.stringify(readJsonRows()));
                        }
                    }
                };

                readStream.on("data", chunk => {
                    lineBuffer += chunk;
                
                    const lines = lineBuffer.split("\n");
                    lineBuffer = lines.pop() || "";

                    for (const line of lines) {
                        processLine(line);
                    }
                });

                readStream.on("end", () => {
                    if (lineBuffer) {
                        processLine(lineBuffer);
                    }

                    if (writeStream) {
                        writeStream.write("]");
                        writeStream.end();
                    }
                    
                });

                readStream.on('error', (error) => {
                    logger.error(`An error occurred while reading the file: ${error.message}`);
                });

        } catch (err: any) {
            logger.error(`Failed to read json file: ${err.message}`);
        }
    } else if (!path) {
        let headers: string[] = [];
        let dataReceived = false;
        const timeout = setTimeout(() => {
            if (!dataReceived) {
                process.exit(0);
            }
        }, 100);
    
        const transformStream = new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform(chunk, encoding, callback) {
                dataReceived = true; 
                clearTimeout(timeout);
    
                const line = chunk.toString();
                let json;
    
                if (!headers.length) {
                    headers = line.split(delimiter);
                    return callback();
                } else {
                    json = csvToJsonLine(headers, line);
                }
    
                this.push(JSON.stringify(json) + "\n");
                callback();
            }
        });
    
        await new Promise((resolve, reject) => {
            process.stdin
                .pipe(transformStream)
                .pipe(process.stdout)
                .on("end", resolve)
                .on("error", (error: Error) => {
                    logger.error("Failed to handle passed data: " + error.message);
                    reject(error);
                });
        });
    } else {
        error.fatal("No data or path provided")
    }
});

csvConverter.addArg(new Flag("path", "Path to csv file"));
csvConverter.addArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverter.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverter.addFlag(new Flag("--db", "Flag to save the output to the database"));
csvConverter.addFlag(new Flag("--readDb", "Flag to read json rows from the database"));
csvConverter.addFlag(new Flag("--d", "Specify csv delimeter"));