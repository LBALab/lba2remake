import { readHqrHeader, readHqrEntry, Entry, } from './hqr_reader';
import { readFromFile } from './array_buffer_fs';
import fs from 'fs';

/*
This will unpack hqr file named <myHqrFile> to a folder-based format,
that is accessible by users and code and allows to not repack hqr when doing changes to its parts.

The structure is the following
<myHqrFile>.json => json containing all the headers of the HQR files with references to file names
    instead of offsets
<mhqrFile>_data => folder containing the files for each entry of this HQR

Usage:
writeOpenHqr('EN_GAM.VOX', true, (index, folder, buffer) => {
    const fileName = `voice_${index}.mp4`;
    fs.writeFileSync(`${folder}${fileName}`, buffer);
    return fileName;
});

The callback is provided to specify the custom code to write entry to a file.
Necessary convertions can be performed. The data folder and index is provided.
The callback must return the fileName (without path) that will be referenced in the headers json.

*/

export interface OpenEntry {
    index: number;
    type: number;
    file: string;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

export const writeOpenHqr = async (hqrFilePath: string, isVoxHQR: boolean,
    writeEntry: (index: number, folder: string,
        entry: Entry, buffer: ArrayBuffer) => Promise<string>) => {

    const headers = [];
    const buffer = readFromFile(hqrFilePath);
    const entries = readHqrHeader(buffer, isVoxHQR);

    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.isBlank) {
            headers.push(buildHeader(entry, ''));
            continue;
        }
        const entryBuffer = readHqrEntry(buffer, entry);
        const folderPath = `${hqrFilePath}_data/`;
        createFolderIfNotExists(folderPath);
        const fileName = await writeEntry(i, folderPath, entry, entryBuffer);
        headers.push(buildHeader(entry, fileName));
    }
    const jsonContent = JSON.stringify(headers, null, 4);
    fs.writeFileSync(`${hqrFilePath}.json`, jsonContent, 'utf8');
};

const buildHeader = (entry: Entry, fileName: string) => {
    return {
        index: entry.index,
        type: entry.type,
        file: fileName,
        hasHiddenEntry: entry.hasHiddenEntry,
        nextHiddenEntry: entry.nextHiddenEntry
    };
};

const createFolderIfNotExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
};
