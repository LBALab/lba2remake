import fs from 'fs';
import {readHqrHeader, readHqrEntry} from "./hqr_reader"

const videoConvertor = () => {
    const videoFolderPath = "./www/data/VIDEO/";
    const videoHqrPath = videoFolderPath + "VIDEO.HQR";
    if (!fs.existsSync(videoHqrPath)) {
        console.error(`File not found: ${videoHqrPath}`);
        return;
    }
    console.log(`Will now extract from ${videoHqrPath}`);
    const buffer = fs.readFileSync(videoHqrPath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const entries = readHqrHeader(arrayBuffer, false);
    const size = entries.length;
    for (let i = 0; i < size; i++) {
        const video = readHqrEntry(arrayBuffer, entries[i]);
        const writeBuffer = Buffer.from(new Uint8Array(video));
        const writePath = `${videoFolderPath}VIDEO${i.toString().padStart(2, "0")}.smk`;
        fs.writeFileSync(writePath, writeBuffer);
        console.log(`Successfully extracted ${writePath}`);
    }
};

const convertors = {
    "video": videoConvertor,
};

const convert = () => {
    const convertorName = process.argv[2];
    if (!convertorName) {
        console.error(`Please provide argument for convertor. Supported: ${Object.keys(convertors)}`);
        return;
    }
    const convertor = convertors[convertorName];
    if (!convertor) {
        console.error(`Not supported convertor type: ${convertorName}; Supported: ${Object.keys(convertors)}`);
        return;
    }
    convertor();
};

convert();
