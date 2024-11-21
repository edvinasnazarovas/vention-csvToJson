import { CLI, Flag } from "../lib/cli";
import { AppError} from "../lib/error";
import { CsvTransformer } from "./transfomer";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

export const csvConverter = new CLI("Converts csv data to json", async (params) => {
    const transformer = new CsvTransformer();

    const path = params["path"];
    const savePath = params["savePath"];

    if (path && typeof path === "string") {
        const readStream = createReadStream(path);

        if (savePath && typeof savePath === "string") {
            const writeStream = createWriteStream(savePath);

            await pipeline(readStream, transformer, writeStream);

            return;
        } else if (params["--log"] === true) {
            await pipeline(readStream, transformer);
        } else {
            AppError.fatal("Neither a save path or the --log flag was provided. Exiting...");
        }
    } else if (!path && process.stdin.readableLength) {
        if (savePath && typeof savePath === "string") {
            const writeStream = createWriteStream(savePath);

            await pipeline(process.stdin, transformer, writeStream);

            return;
        }
        
        await pipeline(process.stdin, transformer, process.stdout);

        return;
    } else {
        AppError.fatal("No data or path provided");
    }
});

csvConverter.addArg(new Flag("path", "Path to csv file"));
csvConverter.addArg(new Flag("savePath", "Path specifying where to store the converted data json file"));
csvConverter.addFlag(new Flag("--log", "Flag to log the converted json out"));
csvConverter.addFlag(new Flag("--db", "Flag to save the output to the database"));