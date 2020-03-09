import JSZip from 'jszip';
import { readFromBuffer } from './array_buffer';

export interface OpenEntry {
    index: number;
    type: number;
    file: string;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

export const readOpenHqrHeader = async (buffer: ArrayBuffer) => {
    const zip = new JSZip(); // TODO - can make optimization and cache zip inside of HQR
    await zip.loadAsync(new Uint8Array(buffer));
    const jsonText = await zip.file('header.json').async('string') as string;
    const header = JSON.parse(jsonText) as OpenEntry[];
    return header;
};

export const readOpenHqrEntry = async (buffer: ArrayBuffer, entry: OpenEntry) => {
    const zip = new JSZip(); // TODO - can make optimization and cache zip inside of HQR
    await zip.loadAsync(new Uint8Array(buffer));
    if (!entry.file) {
        return new ArrayBuffer(0);
    }
    const binaryData = await zip.file(entry.file).async('uint8array') as Uint8Array;
    return readFromBuffer(binaryData);
};
