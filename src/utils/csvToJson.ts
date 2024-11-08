import { promises } from "fs";
import path from "path";

interface Options {
    delimiter?: string
}

const parseCsv = (data: string, options?: Options): object[] => {
    const lines = data.trim().split("\n");

    const headers = lines[0].split(",").map(header => header.trim());

    const jsonData = lines.slice(1).map(line => {
        const values = line.split(options?.delimiter || ",").map(value => value.trim());
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {} as Record<string, string>);
    });

    return jsonData;
};

export const csvToJson = async (filePath: string): Promise<Record<string, any>[]> => {
    const data = await promises.readFile(path.resolve(filePath), "utf8");
    return parseCsv(data);
}