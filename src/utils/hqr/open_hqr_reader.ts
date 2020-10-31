import JSZip from 'jszip';
import { readFromBuffer } from './array_buffer';

export interface OpenEntry {
    index: number;
    name?: string;
    type: number;
    file: string;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

export const readZip = async (buffer: ArrayBuffer) => {
    const zip = new JSZip();
    await zip.loadAsync(new Uint8Array(buffer));
    return zip;
};

export const readOpenHqrHeader = async (zip: JSZip) => {
    const jsonText = await zip.file('header.json').async('text') as string;
    const header = JSON.parse(jsonText) as OpenEntry[];
    return header;
};

export const readOpenHqrEntry = async (zip: JSZip, entry: OpenEntry) => {
    if (!entry || !entry.file) {
        return new ArrayBuffer(0);
    }
    const binaryData = await zip.file(entry.file).async('uint8array') as Uint8Array;
    return readFromBuffer(binaryData);
};
