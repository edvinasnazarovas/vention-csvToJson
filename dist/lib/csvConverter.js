"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvConverter = void 0;
exports.handleOptions = handleOptions;
exports.processStdin = processStdin;
const cli_1 = require("../lib/cli");
const error_1 = require("../lib/error");
const logger_1 = require("../lib/logger");
const csvToJson_1 = require("../lib/csvToJson");
const db_1 = require("../db/db");
const stream_1 = require("stream");
const error = new error_1.ErrorHandler();
const logger = new logger_1.Logger();
function handleOptions(options) {
    if (options.readDb) {
        const rows = (0, db_1.readJsonRows)();
        logger.log(JSON.stringify(rows));
    }
}
async function processStdin(delimiter, options) {
    let headers = [];
    let lineBuffer = "";
    const transformStream = new stream_1.Transform({
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
            }
            else {
                const json = (0, csvToJson_1.csvToJsonLine)(headers, line);
                this.push(JSON.stringify(json) + "\n");
            }
        }
        callback();
    };
    transformStream._flush = function (callback) {
        if (lineBuffer && headers.length) {
            const json = (0, csvToJson_1.csvToJsonLine)(headers, lineBuffer);
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
exports.csvConverter = new cli_1.CLI("Converts csv data to json", async (params) => {
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
            await (0, csvToJson_1.processFile)(path, delimiter, savePath, options);
        }
    }
    else if (!path) {
        await processStdin(delimiter, options);
    }
    else {
        error.fatal("No data or path provided");
    }
});
exports.csvConverter.addArg(new cli_1.Flag("path", "Path to csv file"));
exports.csvConverter.addArg(new cli_1.Flag("savePath", "Path specifying where to store the converted data json file"));
exports.csvConverter.addFlag(new cli_1.Flag("--log", "Flag to log the converted json out"));
exports.csvConverter.addFlag(new cli_1.Flag("--db", "Flag to save the output to the database"));
exports.csvConverter.addFlag(new cli_1.Flag("--readDb", "Flag to read json rows from the database"));
exports.csvConverter.addFlag(new cli_1.Flag("--d", "Specify csv delimeter"));
