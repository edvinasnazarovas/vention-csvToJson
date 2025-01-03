// import { readFile, unlink, writeFile } from "fs/promises";
// import { afterAll, describe, expect, it } from "vitest";

// describe("Tests csv converter", () => {
//     const parser = new T();

//     it("Tests csv line parser", () => {
//         const line = "1,2,3";
//         const headers = ["header1", "header2", "header3"];
//         const expectedJson = {header1: 1, header2: 2, header3: 3};

//         const parsedLine = parser.processLine(line, headers, ",");

//         expect(parsedLine).toEqual(expectedJson);
//     });

//     it("Passes csv file to file processor and validates output", async () => {
//         const csv = `header1,header2,header3\n1,2,3\n1,2,3`;
//         const expectedJson = [{header1: 1, header2: 2, header3: 3}, {header1: 1, header2: 2, header3: 3}];

//         await writeFile("./csv.csv", csv);

//         await parser.processFile("./csv.csv", "./test.json");

//         const output = await readFile("./test.json", "utf-8");

//         const parsedOutput = await JSON.parse(output);

//         expect(parsedOutput).toEqual(expectedJson);
//     });

//     afterAll(async () => {
//         await unlink("csv.csv");
//         await unlink("test.json");
//     })
// });