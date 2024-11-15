import { PassThrough, Readable } from "stream";

export function createLargeCsvStream(sizeInBytes: number): Readable {
    const passThrough = new PassThrough();
    let currentSize = 0;
    const rowSize = 50; // Approximate size of a single row in bytes

    // Sample CSV headers and row template
    const headers = "id,name,age,city\n";
    const sampleRow = "1,John Doe,25,New York\n";

    // Write headers
    passThrough.write(headers);
    currentSize += Buffer.byteLength(headers);

    // Write rows until the target size is reached
    while (currentSize < sizeInBytes) {
        passThrough.write(sampleRow);
        currentSize += rowSize;
    }

    passThrough.end(); // Signal the end of data
    return passThrough;
}