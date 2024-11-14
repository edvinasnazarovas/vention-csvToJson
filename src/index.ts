import { csvConverter } from "./lib/csvConverter";

const args = process.argv.slice(2);

csvConverter.parse(args);