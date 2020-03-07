import fs from 'fs';

export const readFromFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return arrayBuffer;
};

export const writeToFile = (filePath: string, arrayBuffer : ArrayBuffer) => {
    const writeBuffer = Buffer.from(new Uint8Array(arrayBuffer));
    fs.writeFileSync(filePath, writeBuffer);
};
