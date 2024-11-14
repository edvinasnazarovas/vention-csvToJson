import { CLI } from "./lib/cli";
import { csvConverterCommand } from "./commands/csvConverter";

const args = process.argv.slice(2);

const cli = new CLI();

cli.addCommand(csvConverterCommand);

cli.parse(args);