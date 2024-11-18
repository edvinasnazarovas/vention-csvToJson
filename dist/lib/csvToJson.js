"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJson = void 0;
exports.parseCsv = parseCsv;
exports.csvToJsonLine = csvToJsonLine;
exports.processFile = processFile;
const fs_1 = require("fs");
const db_1 = require("../db/db");
const logger_1 = require("./logger");
const logger = new logger_1.Logger();
/**
 * @deprecated
 */
function parseCsv(data, options) {
    const lines = data.trim().split("\n");
    const headers = lines[0].split(",").map(header => header.trim());
    const parsedCsv = lines.slice(1).map(line => {
        const values = line.split(options?.delimiter || ",").map(value => value.trim());
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {});
    });
    return parsedCsv;
}
;
/**
 * @deprecated
 */
const csvToJson = (data, options) => {
    const parsedData = parseCsv(data, options);
    const json = JSON.stringify(parsedData);
    return json;
};
exports.csvToJson = csvToJson;
function csvToJsonLine(headers, line) {
    const values = line.split(",");
    const jsonObject = {};
    headers.forEach((header, index) => {
        let value = values[index].trim();
        jsonObject[header] = isNaN(Number(value)) ? value : Number(value);
    });
    return jsonObject;
}
async function processFile(path, delimiter, savePath, options) {
    const readStream = (0, fs_1.createReadStream)(path);
    let writeStream;
    if (savePath) {
        writeStream = (0, fs_1.createWriteStream)(savePath);
        writeStream.write("[");
    }
    let headers = null;
    let lineBuffer = "";
    let isFirstLine = true;
    const processLine = (line) => {
        if (!headers)
            return;
        const jsonObject = csvToJsonLine(headers, line);
        const json = JSON.stringify(jsonObject, null, 2);
        if (writeStream) {
            if (!isFirstLine) {
                writeStream.write(",");
            }
            else {
                isFirstLine = false;
            }
            writeStream.write(json);
        }
        if (options?.log)
            logger.log(json);
        if (options?.saveToDb)
            (0, db_1.saveJsonToDatabase)(json);
    };
    await new Promise((resolve, reject) => {
        readStream.on("data", (chunk) => {
            lineBuffer += chunk;
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() || "";
            for (const line of lines) {
                if (!headers) {
                    headers = line.split(delimiter);
                }
                else {
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
