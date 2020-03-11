// tslint:disable: no-console
// tslint:disable: max-line-length => only for ffmpeg commands that look ugly if splitting them too much
import fs from 'fs';
import {readHqrHeader, readHqrEntry} from '../hqr/hqr_reader';
import path from 'path';
import { readFromFile, writeToFile } from '../hqr/array_buffer_fs';
import { writeOpenHqr } from '../hqr/open_hqr_writer';
import { executeCommand } from '../fsutils';
import FFmpeg from 'ffmpeg-cli';

const introVideoIndex = 17;
const videoLanguageTracks = {
    en: 4,
    de: 3,
    fr: 2,
    music: 1
};

const videoConvertor = async () => {
    const videoFolderPath = './www/data/VIDEO/';
    const videoHqrPath = `${videoFolderPath}VIDEO.HQR`;
    const languageTrack = readLanguageTrackFromArguments();

    const arrayBuffer = readFromFile(videoHqrPath);
    if (arrayBuffer == null) {
        console.error(`File not found: ${videoHqrPath}`);
        return;
    }

    console.log(`Will now extract from ${videoHqrPath}`);
    const entries = readHqrHeader(arrayBuffer, false);
    const size = entries.length;
    for (let i = 0; i < size; i += 1) {
        const ind = i + 1;
        const fileName = `${videoFolderPath}VIDEO${ind.toString().padStart(2, '0')}`;
        const writePath = `${fileName}.smk`;
        const writeMp4Path = `${fileName}.mp4`;
        const video = readHqrEntry(arrayBuffer, entries[i]);
        writeToFile(writePath, video);
        console.log(`Successfully extracted ${writePath}`);
        await convertToMp4(ind, languageTrack, writePath, writeMp4Path);
        if (fs.existsSync(writeMp4Path)) {
            fs.unlinkSync(writePath);
        }
    }
};

export const readLanguageTrackFromArguments = () => {
    if (process.argv.length < 4) {
        console.warn('Not specified language. The voice will be in english. ' +
            `Supported languages: ${Object.keys(videoLanguageTracks)}`);
        return videoLanguageTracks['en'];
    }
    const lang = process.argv[3];
    const languageTrack = videoLanguageTracks[lang];
    if (!languageTrack) {
        console.warn(`Unsupported language ${lang}. Falling back to english. ` +
            `Supported: ${Object.keys(videoLanguageTracks)}`);
        return videoLanguageTracks['en'];
    }
    return languageTrack;
};

const readMusicBitrateArguments = () => {
    if (process.argv.length < 5) {
        console.warn('Not specified music bitrate. Will use 128k for tracks and 32k for the rest.');
        return [128, 32];
    }
    return [parseInt(process.argv[3], 10), parseInt(process.argv[4], 10)];
};

const readBitrateArguments = () => {
    if (process.argv.length < 4) {
        console.warn('Not specified voice bitrate. Will use 64k');
        return 64;
    }
    return parseInt(process.argv[3], 10);
};

const readFilePathFromArguments = () => {
    if (process.argv.length < 4) {
        throw 'Not specified file path';
    }
    return process.argv[3];
};

const convertToMp4 = async (videoIndex: number, languageTrack: number,
        inputFilePath: string, outputFilePath: string) => {

    let command: string;
    if (videoIndex === introVideoIndex) {
        const aviPath = `${inputFilePath}.avi`;
        command = `rm -f "${aviPath}" && ` +
        `ffmpeg -i "${inputFilePath}" -q:v 0 -q:a 0 -filter_complex "[0:1][0:${languageTrack}] amerge=inputs=2" "${aviPath}" && ` +
        `rm -f "${outputFilePath}" && ffmpeg -i "${aviPath}" -q:v 0 -q:a 0 "${outputFilePath}" && rm -f ${aviPath}`;
    } else {
        command = `rm -f "${outputFilePath}" && ffmpeg -i "${inputFilePath}" -c:v libx264 -crf 22 -pix_fmt yuv420p "${outputFilePath}"`;
    }
    await executeCommand(command);
};

const musicConvertor = async () => {
    const folderPath = './www/data/MUSIC/';
    const files = fs.readdirSync(folderPath);
    const extensions = {'.wav': 1, '.ogg': 1};
    const filesToConvert = files.filter(file => path.extname(file).toLowerCase() in extensions);
    const size = filesToConvert.length;
    const bitrates = readMusicBitrateArguments();
    for (let i = 0; i < size; i += 1) {
        const file = filesToConvert[i];
        const inputFile = `${folderPath}${file}`;
        const outputFileName = getOutputMusicFileName(file);
        const outputFilePath = `${folderPath}${outputFileName}`;
        const bitrate = getMusicFileBitrate(outputFileName, bitrates);
        await convertToMp4Audio(inputFile, outputFilePath, bitrate);
    }
};

const getBaseName = (fileName: string) => {
    return `${path.basename(fileName, path.extname(fileName))}`;
};

const getOutputMusicFileName = (fileName: string) => {
    if (fileName.toLowerCase() === 'lba2.ogg') {
        return 'Track6.mp4';
    }
    return `${getBaseName(fileName)}.mp4`;
};

const getMusicFileBitrate = (fileName: string, bitrates: number[]) => {
    const higherBitrateFiles = {
        'tadpcm1.mp4': 1,
        'tadpcm2.mp4': 1,
        'tadpcm3.mp4': 1,
        'tadpcm4.mp4': 1,
        'tadpcm5.mp4': 1,
        'track6.mp4': 1
    };
    if (fileName.toLowerCase() in higherBitrateFiles) {
        return bitrates[0];
    }
    return bitrates[1];
};

const voiceConvertor = async () => {
    const folderPath = './www/data/VOX/';
    const files = fs.readdirSync(folderPath);
    const bitrate = readBitrateArguments();
    const filesToConvert = files.filter(file =>
        path.extname(file).toLowerCase() === '.vox' &&
        !file.toLowerCase().includes('_aac.')
    );
    const size = filesToConvert.length;
    for (let i = 0; i < size; i += 1) {
        const file = filesToConvert[i];
        const inputFile = `${folderPath}${file}`;
        const nameOnly = getBaseName(file);
        const outputFile = `${folderPath}${nameOnly}_AAC.VOX.zip`;
        await writeOpenHqr(inputFile, outputFile, true, async (index, folder, entry, buffer) => {
            // Restoring RIFF in header because LBA format has 0 instead of first R
            new Uint8Array(buffer)[0] = 0x52;

            const baseFileName = `voice_${(index + 1).toString().padStart(3, '0')}`;
            const originalFileName = `${baseFileName}.wav`;
            const originalFilePath = `${folder}${originalFileName}`;
            writeToFile(originalFilePath, buffer);

            const outputFileName =  `${baseFileName}.mp4`;
            const outputFilePath = `${folder}${outputFileName}`;

            console.log('Processing HQR entry ', entry);

            await convertToMp4Audio(originalFilePath, outputFilePath, bitrate);
            if (fs.existsSync(outputFilePath)) {
                fs.unlinkSync(originalFilePath);
            }
            return outputFileName;
        });
    }
};

const samplesConvertor = async () => {
    const filePath = './www/data/SAMPLES.HQR';
    const outputFile = './www/data/SAMPLES_AAC.HQR.zip';
    const bitrate = readBitrateArguments();
    await writeOpenHqr(filePath, outputFile, false, async (index, folder, entry, buffer) => {
        // Restoring RIFF in header because LBA format has 0 instead of first R
        new Uint8Array(buffer)[0] = 0x52;

        const baseFileName = `sfx_${(index + 1).toString().padStart(3, '0')}`;
        const originalFileName = `${baseFileName}.wav`;
        const originalFilePath = `${folder}${originalFileName}`;
        writeToFile(originalFilePath, buffer);

        const outputFileName =  `${baseFileName}.mp4`;
        const outputFilePath = `${folder}${outputFileName}`;

        console.log('Processing HQR entry ', entry);

        await convertToMp4Audio(originalFilePath, outputFilePath, bitrate);
        if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(originalFilePath);
        }
        return outputFileName;
    });
};

const hqrToOpenHqrConvertor = async () => {
    const filePath = readFilePathFromArguments();
    const outputFile = `${filePath}.zip`;
    await writeOpenHqr(filePath, outputFile, false, async (index, folder, _entry, buffer) => {
        const itemFileName = `item_${(index + 1).toString().padStart(3, '0')}.dat`;
        const originalFilePath = `${folder}${itemFileName}`;
        writeToFile(originalFilePath, buffer);
        return itemFileName;
    });
};

const convertToMp4Audio = async (inputFilePath: string, outputFilePath: string, bitrate: number) => {
    console.log(`Converting ${inputFilePath} to ${outputFilePath} with bitrate ${bitrate}k`);
    await executeCommand(`rm -f "${outputFilePath}"`);
    FFmpeg.runSync(`-i "${inputFilePath}" -c:a aac -b:a ${bitrate}k "${outputFilePath}"`);
};

const convertors = {
    video: videoConvertor,
    music: musicConvertor,
    voice: voiceConvertor,
    samples: samplesConvertor,
    hqr: hqrToOpenHqrConvertor
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
