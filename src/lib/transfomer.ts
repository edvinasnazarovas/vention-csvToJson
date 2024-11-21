import { Transform, TransformCallback } from "stream";
import { AppError } from "./error";

interface Options {
    log: boolean
}

export class CsvTransformer extends Transform {
    private initialized = false;
    private headers: string[] = [];
    private delimiter: string = "";
    private lineIndex = 1;
    private buffer = "";

    public processLine(line: string, headers: string[], delimiter: string): string {
        const fields = line.split(delimiter);

        if (fields.length !== headers.length) {
            console.error(`Malformed line at: line ${this.lineIndex}`);
            console.log(line)
            return "{},\n";
        }

        return `{\n${fields.map((value, index) => `\t"${headers[index]}":"${value}"`).join(",\n")}\n}`;
    }

    /**
     * Heuristic method for infering the delimiter from a chunk of csv data
     * @param lines Array of csv lines
     * @returns The csv delimiter char
     */
    public inferDelimiter(lines: string[]) {
        const delimiters = [",", "\t", ";", "|"];
        const scores: Record<string, {consistency: 1 | 0, avgFields: number, heuristic: number}>  = {};

        for (const delimiter of delimiters) {
            const fieldCounts = lines.map(line => line.split(delimiter).length);
            const uniqueFieldCounts = new Set(fieldCounts);

            const consistency = uniqueFieldCounts.size === 1 ? 1 : 0;
            const avgFields = fieldCounts.reduce((a, b) => a + b, 0) / fieldCounts.length;

            scores[delimiter] = {
              consistency,
              avgFields,
              heuristic: avgFields + consistency  
            };
        }

        return Object.keys(scores).reduce((best, current) => {
            if (scores[current].heuristic > scores[best].heuristic) {
                return current;
            }
            return best;
        }, delimiters[0]);
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        const data = this.buffer ? this.buffer + chunk.toString("utf8") : chunk.toString("utf8");
        const lines = data.split("\n");

        this.buffer = lines.pop() || "";

        if (!this.delimiter) this.delimiter = this.inferDelimiter(lines);
        if (!this.headers.length) this.headers = lines.shift()!.split(this.delimiter);

        for (const line of lines) {
            this.lineIndex++;
            if (line.trim()) {
                this.push(this.processLine(line.trim(), this.headers, this.delimiter) + ",\n");
            }
    }

    callback();
    }
    
    _flush(callback: TransformCallback): void {
        if (this.buffer.trim()) {
            this.lineIndex++;
            this.push(this.processLine(this.buffer.trim(), this.headers, this.delimiter) + "\n");
        }
        this.push("]");
        callback();
    }
}