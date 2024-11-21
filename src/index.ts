import { csvConverter } from "./lib/csvConverter";
import { AppError } from "./lib/error";

const args = process.argv.slice(2);

if (!args.length) {
    AppError.fatal("No arguments provided.");
}

csvConverter.parse(args);