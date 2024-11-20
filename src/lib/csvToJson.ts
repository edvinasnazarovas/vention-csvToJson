import { createReadStream, createWriteStream, WriteStream } from "fs";
import { saveJsonToDatabase } from "../db/db";
import { Logger } from "./logger";
import { Transform } from "stream";
import { AppError } from "./error";

const logger = new Logger();

interface ParserOptions {
    log: boolean,
    saveToDb: boolean,
}

export class CsvParser {
    private options: ParserOptions = {
        log: false,
        saveToDb: false,
    };

    constructor(options?: Partial<ParserOptions>) {
        this.options = {...this.options, ...options};
    }

    /**
     * Recursive method that processes csv lines and returns the processed json data string
     * @param line The csv line to be parsed
     * @param headers The csv headers
     * @param delimiter The delimiter of the csv data
     * @param processedLine The processed data
     * @param charIndex The current char position of the processor
     * @param fieldIndex The current index of the field being processed
     * @returns JSON data string
     */
    private processLine = (line: string, headers: string[], delimiter: string, processedLine: string = "", charIndex: number = 0, fieldIndex: number = 0): string => { // maybe add a parsed line validation check?
        if (fieldIndex >= headers.length) { // If the amount of processed fields equals the amount of headers, return the line
            return processedLine;
        }

        let buffer = ""; // storage for processed field characters
        let enclosed = false;

        while(line[charIndex] && line[charIndex] !== delimiter) { // loop while the delimiter is not encountered
            const char = line[charIndex];

            if (char === "\"") {
                enclosed = !enclosed;
                charIndex++; // Skip over the double quotes
                continue;
            }

            if (enclosed && char === "\\" && line[charIndex + 1] === "\\") {
                buffer += line[charIndex + 2];

                charIndex += 3; // Skip over the field char equaling the delimiter
                continue;
            }

            buffer += char;

            charIndex++;
        }

        charIndex++;

        processedLine += `\t"${headers[fieldIndex]}":"${buffer}"`;

        if ((fieldIndex + 1) !== headers.length) { // if it is not the last field, add a comma after the closing bracket
            processedLine += ",";
        }

        processedLine += "\n";

        fieldIndex++;

        return this.processLine(line, headers, delimiter, processedLine, charIndex, fieldIndex); // rinse and repeat until the line is processed
    };

    /**
     * Heuristic method for infering the delimiter from a chunk of csv data
     * @param lines Array of csv lines
     * @returns The csv delimiter char
     */
    private inferDelimiter(lines: string[]) {
        const delimiters = [",", "\t", ";", "|"];
        const scores: Record<string, {consistency: 1 | 0, avgFields: number, heuristic: number}>  = {};

        for (const delimiter of delimiters) {
            const fieldCounts = lines.map(line => line.split(delimiter).length);
            const uniqueFieldCounts = new Set(fieldCounts);

            const consistency = uniqueFieldCounts.size === 1 ? 1 : 0;
            const avgFields = fieldCounts.reduce((a, b) => a + b, 0) / fieldCounts.length;

            scores[delimiter] = {
              consistency,
              avgFields,
              heuristic: avgFields + consistency  
            };
        }

        return Object.keys(scores).reduce((best, current) => {
            if (scores[current].heuristic > scores[best].heuristic) {
                return current;
            }
            return best;
        }, delimiters[0]);
    }

    public async processFile(path: string, savePath?: string | null, overrideOptions: ParserOptions = this.options) { // TODO: Add check for file extension
        const options = {...this.options, ...overrideOptions};

        const readStream = createReadStream(path);
        let writeStream: WriteStream | undefined;
    
        if (savePath) {
            writeStream = createWriteStream(savePath);
            writeStream.write("[");
        }
    
        let headers: string[] = [];
        let lineBuffer = "";
        let delimiter: string | undefined = undefined;
        let isFirstLine = true;

        await new Promise<void>((resolve, reject) => {
            readStream.on("data", (chunk) => {
                lineBuffer += chunk;
    
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop() || "";

                if (!delimiter) {
                    delimiter = this.inferDelimiter(lines);
                }

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];

                    if (!headers.length && i === 0) {
                        headers = line.split(delimiter);
                    } else {
                        const processedLine = this.processLine(line, headers, delimiter);

                        if (!isFirstLine) {
                            writeStream?.write(",\n");
                        } else {
                            isFirstLine = false;
                        }

                        writeStream?.write(`{${processedLine}}`);
                    }
                }
            });
    
            readStream.on("end", () => {
                if (!delimiter) {
                    AppError.fatal("No delimiter on readstream end. Not supposed to happen.");
                }

                if (lineBuffer && headers) {
                    const processedLine = this.processLine(lineBuffer, headers, delimiter);
                    writeStream?.write(processedLine);
                    if (options.log) logger.log(processedLine);
                    if (options.saveToDb) saveJsonToDatabase(processedLine);
                }
    
                if (writeStream) {
                    writeStream.write("]");
                    writeStream.end();
                }
                resolve();
            });
    
            readStream.on("error", (error) => {
                logger.error(`An error occurred while reading the file: ${error.message}`);
                reject(error);
            });
    
            if (writeStream) {
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
            }
        });
    }

    public async processStdin() {
        let headers: string[] = [];
        let lineBuffer = "";
        let delimiter: string | undefined = undefined;
    
        const transformStream = new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
    
            transform: (chunk, encoding, callback) => {
                lineBuffer += chunk.toString();
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop() || "";

                if (!delimiter) {
                    delimiter = this.inferDelimiter(lines);
                }
    
                for (const line of lines) {
                    if (!headers.length) {
                        headers = line.split(delimiter);
                    } else {
                        const processedLine = this.processLine(line, headers, delimiter);
                        transformStream.push(JSON.stringify(processedLine));
                    }
                }
                callback();
            },
    
            flush: (callback) => {
                if (!delimiter) {
                    AppError.fatal("No delimiter. Not supposed to happen.");
                }

                if (lineBuffer && headers.length) {
                    const json = this.processLine(lineBuffer, headers, delimiter);
                    transformStream.push(JSON.stringify(json) + "\n");
                }
                callback();
            },
        });
    
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
}