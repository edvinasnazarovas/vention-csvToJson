import { createReadStream, createWriteStream, WriteStream } from "fs";
import { saveJsonToDatabase } from "../db/db";
import { Logger } from "./logger";

interface Options {
    delimiter?: string
}

const logger = new Logger();

/**
 * @deprecated
 */
export function parseCsv(data: string, options?: Options): object[] {
    const lines = data.trim().split("\n");

    const headers = lines[0].split(",").map(header => header.trim());

    const parsedCsv = lines.slice(1).map(line => {
        const values = line.split(options?.delimiter || ",").map(value => value.trim());
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {} as Record<string, string>);
    });

    return parsedCsv;
};

/**
 * @deprecated
 */
export const csvToJson = (data: string, options?: Options): string => {
    const parsedData = parseCsv(data, options);
    const json = JSON.stringify(parsedData);
    return json;
}

export function csvToJsonLine(headers: string[], line: string): Record<string, any> {
    const values = line.split(",");
    const jsonObject: Record<string, any> = {};

    headers.forEach((header, index) => {
        let value = values[index].trim();

        jsonObject[header] = isNaN(Number(value)) ? value : Number(value);
    });

    return jsonObject;
}

export async function processFile(path: string, delimiter: string, savePath?: string | null, options?: any) {
    const readStream = createReadStream(path);
    let writeStream: WriteStream | undefined;

    if (savePath) {
        writeStream = createWriteStream(savePath);
        writeStream.write("[");
    }

    let headers: string[] | null = null;
    let lineBuffer = "";
    let isFirstLine = true;

    const processLine = (line: string) => {
        if (!headers) return;

        const jsonObject = csvToJsonLine(headers, line);
        const json = JSON.stringify(jsonObject, null, 2);

        if (writeStream) {
            if (!isFirstLine) {
                writeStream.write(",");
            } else {
                isFirstLine = false;
            }
            writeStream.write(json);
        }

        if (options?.log) logger.log(json);
        if (options?.saveToDb) saveJsonToDatabase(json);
    };

    await new Promise<void>((resolve, reject) => {
        readStream.on("data", (chunk) => {
            lineBuffer += chunk;

            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() || "";

            for (const line of lines) {
                if (!headers) {
                    headers = line.split(delimiter);
                } else {
                    processLine(line);
                }
            }
        });

        readStream.on("end", () => {
            if (lineBuffer && headers) {
                processLine(lineBuffer);
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