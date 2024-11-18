"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const vitest_1 = require("vitest");
const csvToJson_1 = require("../lib/csvToJson");
(0, vitest_1.describe)("Tests csv converter", () => {
    (0, vitest_1.it)("Tests csv line parser", () => {
        const line = "1,2,3";
        const headers = ["header1", "header2", "header3"];
        const expectedJson = { header1: 1, header2: 2, header3: 3 };
        const parsedLine = (0, csvToJson_1.csvToJsonLine)(headers, line);
        (0, vitest_1.expect)(parsedLine).toEqual(expectedJson);
    });
    (0, vitest_1.it)("Passes csv file to file processor and validates output", async () => {
        const csv = `header1,header2,header3\n1,2,3\n1,2,3`;
        const expectedJson = [{ header1: 1, header2: 2, header3: 3 }, { header1: 1, header2: 2, header3: 3 }];
        await (0, promises_1.writeFile)("./csv.csv", csv);
        await (0, csvToJson_1.processFile)("./csv.csv", ",", "./test.json");
        const output = await (0, promises_1.readFile)("./test.json", "utf-8");
        const parsedOutput = await JSON.parse(output);
        (0, vitest_1.expect)(parsedOutput).toEqual(expectedJson);
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, promises_1.unlink)("csv.csv");
        await (0, promises_1.unlink)("test.json");
    });
});
