"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csvConverter_1 = require("./lib/csvConverter");
const args = process.argv.slice(2);
csvConverter_1.csvConverter.parse(args);
