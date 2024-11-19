import { createReadStream, createWriteStream, WriteStream } from "fs";
import { saveJsonToDatabase } from "../db/db";
import { Logger } from "./logger";

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

    constructor(options: Partial<ParserOptions>) {
        this.options = {...this.options, ...options};
    }

    private csvToJsonLine(headers: string[], line: string): Record<string, any> {
        const values = line.split(",");
        const jsonObject: Record<string, any> = {};
    
        headers.forEach((header, index) => {
            let value = values[index].trim();
    
            jsonObject[header] = isNaN(Number(value)) ? value : Number(value);
        });
    
        return jsonObject;
    }

    private processLine = (writeStream: WriteStream | undefined, line: string, headers: string[], isFirstLine: boolean, options: ParserOptions) => {
        if (!headers) return;

        const jsonObject = this.csvToJsonLine(headers, line);
        const json = JSON.stringify(jsonObject, null, 2);

        if (writeStream) {
            if (!isFirstLine) {
                writeStream.write(",");
            } else {
                isFirstLine = false;
            }
            writeStream.write(json);
        }

        if (options.log) logger.log(json);
        if (options.saveToDb) saveJsonToDatabase(json);
    };

    private inferDelimiter(lines: string[]) {
        const delimiters = [",", "\t", ";", "|", " "];
        const scores: Record<string, {consistency: 1 | 0, avgFields: number}>  = {};

        for (const delimiter of delimiters) {
            const fieldCounts = lines.map(line => line.split(delimiter).length);
            const uniqueFieldCounts = new Set(fieldCounts);

            scores[delimiter] = {
                consistency: uniqueFieldCounts.size === 1 ? 1 : 0,
                avgFields: fieldCounts.reduce((a, b) => a + b, 0) / fieldCounts.length
            };
        }

        return Object.keys(scores).reduce((best, current) => {
            if (scores[current].consistency > scores[best].consistency || (scores[current].consistency === scores[best].consistency && scores[current].avgFields > scores[best].avgFields)) {
                return current;
            }
            return best;
        }, delimiters[0]);
    }

    public async processFile(path: string, savePath?: string | null, overrideOptions: ParserOptions = this.options) {
        const options = {...this.options, ...overrideOptions};

        const readStream = createReadStream(path);
        let writeStream: WriteStream | undefined;
    
        if (savePath) {
            writeStream = createWriteStream(savePath);
            writeStream.write("[");
        }
    
        let headers: string[] | null = null;
        let lineBuffer = "";
        let isFirstLine = true;
        let delimiter: string | undefined = undefined;
    
        await new Promise<void>((resolve, reject) => {
            readStream.on("data", (chunk) => {
                lineBuffer += chunk;
    
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop() || "";

                if (!delimiter) {
                    delimiter = this.inferDelimiter(lines);
                }

                for (const line of lines) {
                    if (!headers) {
                        headers = line.split(delimiter);
                    } else {
                        this.processLine(writeStream, line, headers, isFirstLine, options);
                    }
                }
            });
    
            readStream.on("end", () => {
                if (lineBuffer && headers) {
                    this.processLine(writeStream, lineBuffer, headers, isFirstLine, options);
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
}