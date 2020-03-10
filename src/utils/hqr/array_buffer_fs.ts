import fs from 'fs';
import { readFromBuffer } from './array_buffer';

export const readFromFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const buffer = fs.readFileSync(filePath);
    return readFromBuffer(buffer);
};

export const writeToFile = (filePath: string, arrayBuffer : ArrayBuffer) => {
    const writeBuffer = Buffer.from(new Uint8Array(arrayBuffer));
    fs.writeFileSync(filePath, writeBuffer);
};
