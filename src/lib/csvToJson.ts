import { promises } from "fs";
import path from "path";

interface Options {
    delimiter?: string
}

const parseCsv = (data: string, options?: Options): object[] => {
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

export const csvToJson = (data: string, options?: Options): string => {
    const parsedData = parseCsv(data, options);
    const json = JSON.stringify(parsedData);
    return json;
}

export function csvToJsonLine(headers: string[], line: string) {
    const values = line.split(',');
    const jsonObject = headers.reduce((obj: Record<string, string>, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
    return jsonObject;
  }