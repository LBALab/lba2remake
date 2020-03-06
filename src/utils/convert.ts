import fs from 'fs';
import {readHqrHeader, readHqrEntry} from "./hqr_reader"
import { exec } from 'child_process';

const introVideoIndex = 17;

const videoConvertor = async () => {
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
        const ind = i + 1;
        const video = readHqrEntry(arrayBuffer, entries[i]);
        const writeBuffer = Buffer.from(new Uint8Array(video));
        const fileName = `${videoFolderPath}VIDEO${ind.toString().padStart(2, "0")}`;
        const writePath = `${fileName}.smk`;
        const writeMp4Path = `${fileName}.mp4`;
        fs.writeFileSync(writePath, writeBuffer);
        console.log(`Successfully extracted ${writePath}`);
        await convertToMp4(ind, writePath, writeMp4Path);
        if (fs.existsSync(writeMp4Path)) {
            fs.unlinkSync(writePath);
        }
    }
};

const convertToMp4 = (videoIndex: number, inputFilePath: string, outputFilePath: string) => {
    return new Promise((resolve) => {
        let command: string;
        if (videoIndex === introVideoIndex) {
            const aviPath = `${inputFilePath}.avi`;
            command = `rm -f "${aviPath}" && ffmpeg -i "${inputFilePath}" -q:v 0 -q:a 0 -filter_complex "[0:1][0:3] amerge=inputs=2" "${aviPath}" && `+
            `rm -f "${outputFilePath}" && ffmpeg -i "${aviPath}" -q:v 0 -q:a 0 "${outputFilePath}" && rm -f ${aviPath}`;
        }
        else {
            command = `rm -f "${outputFilePath}" && ffmpeg -i "${inputFilePath}" -c:v libx264 -crf 22 -pix_fmt yuv420p "${outputFilePath}"`;
        }

        exec(command, (error, _stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            resolve();
        });
    });
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
