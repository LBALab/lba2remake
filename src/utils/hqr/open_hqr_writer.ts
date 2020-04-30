import { readHqrHeader, readHqrEntry, Entry, } from './hqr_reader';
import { readFromFile } from './array_buffer_fs';
import fs from 'fs';
import JSZip from 'jszip';
import { OpenEntry } from './open_hqr_reader';
import { createFolderIfNotExists } from '../fsutils';

/*
This will repack hqr file named <myHqrFile> to a so-called OpenHqr format, that is a .zip file.

The structure is the following
header.json => json containing all the headers of the HQR files with references to file names
    instead of offsets
+ the files for each entry of this HQR (referenced in header.json)

The callback is required by client code to specify the custom code to write entry to a file.
Necessary convertions can be performed. The write folder to use and index is provided.
The callback must return the fileName (without path) that will be referenced in the headers json.
Obviously the file name must be unique (usually add the index to the file name)
*/

export const writeOpenHqr = async (hqrFilePath: string, outputFilePath: string, isVoxHQR: boolean,
    writeEntry: (index: number, folder: string,
        entry: Entry, buffer: ArrayBuffer) => Promise<string>) => {

    const headers = [];
    const buffer = readFromFile(hqrFilePath);
    const entries = readHqrHeader(buffer, isVoxHQR);
    const folderPath = `${hqrFilePath}_data/`;
    const zip = new JSZip();
    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.isBlank) {
            headers.push(buildHeader(entry, ''));
            continue;
        }
        const entryBuffer = readHqrEntry(buffer, entry);
        createFolderIfNotExists(folderPath);
        const fileName = await writeEntry(i, folderPath, entry, entryBuffer);
        const filePath = `${folderPath}${fileName}`;
        zip.file(fileName, fs.readFileSync(filePath));
        fs.unlinkSync(filePath);
        headers.push(buildHeader(entry, fileName));
    }
    const jsonContent = JSON.stringify(headers, null, 4);
    zip.file('header.json', jsonContent);

    const zipOptions = {
        type : 'uint8array',
        compression: 'STORE'
    };
    const zippedData = await zip.generateAsync(zipOptions as any) as Uint8Array;
    fs.writeFileSync(outputFilePath, zippedData);
    fs.rmdirSync(folderPath);

    // tslint:disable-next-line: no-console
    console.log(`Packed OpenHqr: ${outputFilePath}`);
};

const buildHeader = (entry: Entry, fileName: string) => {
    return {
        index: entry.index,
        type: entry.type,
        file: fileName,
        hasHiddenEntry: entry.hasHiddenEntry,
        nextHiddenEntry: entry.nextHiddenEntry
    } as OpenEntry;
};
