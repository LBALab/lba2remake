// tslint:disable: no-console
// tslint:disable: max-line-length => only for ffmpeg commands that look ugly if splitting them too much
import fs from 'fs';
import path from 'path';
import os from 'os';
import FFmpeg from 'ffmpeg-cli';
import synth from 'synth-js';

import { CompressionType, HQR, HQREntry, HQRVirtualEntry } from '@lbalab/hqr';
import { removeFile } from '../../src/utils/fsutils';
import { detectVersion, PathDefinitions } from './unpack';

const introVideoIndex = 17;
const videoLanguageTracks = {
    EN: 4,
    DE: 3,
    FR: 2,
    music: 1
};

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);

const videoConvertor = async (game) => {
    if (game === 'LBA') {
        // TODO FLA converter
        return;
    }

    const videoFolderPath = path.normalize('./www/data/LBA2/VIDEO/');
    const videoHqrPath = `${videoFolderPath}VIDEO.HQR`;

    const file = fs.readFileSync(videoHqrPath);
    if (file == null) {
        console.error(`File not found: ${videoHqrPath}`);
        return;
    }

    console.log(`Will now extract from ${videoHqrPath}`);
    const hqr = HQR.fromArrayBuffer(toArrayBuffer(file));
    for (let i = 0; i < hqr.entries.length; i += 1) {
        const ind = i + 1;
        const baseName = `VIDEO${ind.toString().padStart(2, '0')}`;
        const fileBasePath = `${videoFolderPath}${baseName}`;
        const writePath = path.normalize(`${os.tmpdir()}/${baseName}.smk`);
        await fs.writeFileSync(writePath, Buffer.from(hqr.entries[i].content));
        console.log(`Successfully extracted ${writePath}`);
        const languageTracks: string[] = getVideoLanguageTracks(ind);

        const writeMp4Paths: string[] = [];
        for (let j = 0; j < languageTracks.length; j += 1) {
            const lang = languageTracks[j];
            const writeMp4Path = lang ? `${fileBasePath}_${lang}.mp4` : `${fileBasePath}.mp4`;
            await convertToMp4(lang ? videoLanguageTracks[lang] : -1, writePath, writeMp4Path);
            writeMp4Paths.push(writeMp4Path);
        }

        fs.unlinkSync(writePath);
    }
};

const getVideoLanguageTracks = (videoIndex: number) => {
    if (introVideoIndex === videoIndex) {
        return ['EN', 'DE', 'FR'];
    }
    return [''];
};

const readBitrateArguments = () => {
    if (process.argv.length < 4) {
        console.warn('Not specified bitrate. Will use 128k');
        return 128;
    }
    return parseInt(process.argv[4], 10);
};

const convertToMp4 = async (languageTrack: number, inputFilePath: string, outputFilePath: string) => {
    if (languageTrack !== -1) {
        const aviPath = `${inputFilePath}.avi`;
        removeFile(aviPath);
        FFmpeg.runSync(`-i "${inputFilePath}" -q:v 0 -q:a 0 -filter_complex "[0:1][0:${languageTrack}] amerge=inputs=2" "${aviPath}"`);
        removeFile(outputFilePath);
        FFmpeg.runSync(`-i "${aviPath}" -q:v 0 -q:a 0 "${outputFilePath}"`);
        removeFile(aviPath);
    } else {
        removeFile(outputFilePath);
        FFmpeg.runSync(`-i "${inputFilePath}" -c:v libx264 -crf 22 -pix_fmt yuv420p "${outputFilePath}"`);
    }
};

const musicConvertor = async (game) => {
    if (game === 'LBA') {
        midiConvertor(game);
        return;
    }

    const folderPath = path.normalize(`./www/data/${game}/MUSIC/`);
    const files = fs.readdirSync(folderPath);
    const extensions = {'.wav': 1, '.ogg': 1};
    const filesToConvert = files.filter(file => path.extname(file).toLowerCase() in extensions);
    const size = filesToConvert.length;
    const bitrate = readBitrateArguments();
    for (let i = 0; i < size; i += 1) {
        const file = filesToConvert[i];
        const inputFile = `${folderPath}${file}`;
        const outputFileName = getOutputMusicFileName(file);
        const outputFilePath = `${folderPath}${outputFileName}`;

        if (file.toLowerCase().endsWith('ogg')) {
            // For some reason using FFMPEG to directly convert from ogg to aac
            // causes the web audio API implementation in Chrome to stutter
            // when playing back the audio. To get around this, first convert
            // the ogg to a wav, and then run the usual m4a conversion on that
            // resulting wav file...
            const wavOutputFile = outputFileName.replace('m4a', 'wav');
            await convertToWavAudio(inputFile, wavOutputFile);
            await convertToM4aAudio(wavOutputFile, outputFilePath, bitrate);
            removeFile(wavOutputFile);
            continue;
        }

        await convertToM4aAudio(inputFile, outputFilePath, bitrate);
    }
};

const midiConvertor = async (game) => {
    // mi_win for now until we find a way to convert xmidi to midi
    const filePath = path.normalize(`./www/data/${game}/Midi_mi_win.hqr`);
    if (!fs.existsSync(filePath)) {
        return;
    }
    const bitrate = readBitrateArguments();

    const file = fs.readFileSync(filePath);
    if (file == null) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const hqrIn = HQR.fromArrayBuffer(toArrayBuffer(file));
    const hqrOut = new HQR();
    for (let i = 0; i < hqrIn.entries.length; i += 1) {
        const entry = hqrIn.entries[i];
        if (!entry) {
            hqrOut.entries.push(null);
            console.log(`Skipping HQR entry #${i}`);
            continue;
        }
        console.log(`Processing HQR entry #${i}`);
        const wavFilePath = path.normalize(`${os.tmpdir()}/MUSIC${i}.wav`);
        const mp4FilePath = path.normalize(`${os.tmpdir()}/MUSIC${i}.m4a`);

        const wavBuffer = synth.midiToWav(entry.content).toBuffer();
        fs.writeFileSync(wavFilePath, wavBuffer);

        await convertToM4aAudio(wavFilePath, mp4FilePath, bitrate);
        const mp4File = fs.readFileSync(mp4FilePath);
        const tgtEntry = new HQREntry(toArrayBuffer(mp4File), CompressionType.NONE);
        hqrOut.entries.push(tgtEntry);
        fs.unlinkSync(wavFilePath);
        fs.unlinkSync(mp4FilePath);
    }

    const outputFile = path.normalize(`./www/data/${game}/MIDI_AAC.HQR`);
    fs.writeFileSync(outputFile, Buffer.from(hqrOut.toArrayBuffer()));
};

const getBaseName = (fileName: string) => {
    return `${path.basename(fileName, path.extname(fileName))}`;
};

const getOutputMusicFileName = (fileName: string) => {
    if (fileName.toLowerCase() === 'lba2.ogg') {
        return 'TADPCM6.m4a';
    }
    return `${getBaseName(fileName)}.m4a`;
};

const voiceConvertor = async (game) => {
    const folderPath = path.normalize(`./www/data/${game}/VOX/`);
    const files = fs.readdirSync(folderPath);
    const bitrate = readBitrateArguments();
    const filesToConvert = files.filter(file =>
        path.extname(file).toLowerCase() === '.vox' &&
        !file.toLowerCase().includes('_aac.')
    );
    const size = filesToConvert.length;
    for (let i = 0; i < size; i += 1) {
        const fileName = filesToConvert[i];
        const inputFile = `${folderPath}${fileName}`;
        const nameOnly = getBaseName(fileName);
        const file = fs.readFileSync(inputFile);
        if (file == null) {
            console.error(`File not found: ${inputFile}`);
            return;
        }

        const hqrIn = HQR.fromArrayBuffer(toArrayBuffer(file));
        const hqrOut = new HQR();
        for (let j = 0; j < hqrIn.entries.length; j += 1) {
            const entry = hqrIn.entries[j];
            if (!entry) {
                console.log(`Skipping HQR entry #${j}`);
                hqrOut.entries.push(null);
                continue;
            }
            if (entry instanceof HQRVirtualEntry) {
                console.log(`Copying HQR virtual entry #${j}`);
                hqrOut.entries.push(new HQRVirtualEntry(hqrOut, entry.target, entry.metadata));
                continue;
            }
            console.log(`Processing HQR entry #${j}`);
            const baseName = path.basename(inputFile);
            const wavFilePath = path.normalize(`${os.tmpdir()}/${baseName}.${j}.wav`);
            const mp4FilePath = path.normalize(`${os.tmpdir()}/${baseName}.${j}.m4a`);

            // Restoring RIFF in header because LBA format has 0 instead of first R
            if (game === 'LBA2') {
                new Uint8Array(entry.content)[0] = 0x52;
            }
            // Fixed VOC first byte
            if (game === 'LBA') {
                new Uint8Array(entry.content)[0] = 0x43;
            }
            fs.writeFileSync(wavFilePath, Buffer.from(entry.content));

            await convertToM4aAudio(wavFilePath, mp4FilePath, bitrate);
            const mp4File = fs.readFileSync(mp4FilePath);
            const tgtEntry = new HQREntry(toArrayBuffer(mp4File), CompressionType.NONE);
            hqrOut.entries.push(tgtEntry);
            fs.unlinkSync(wavFilePath);
            fs.unlinkSync(mp4FilePath);

            for (let k = 0; k < entry.hiddenEntries.length; k += 1) {
                const hiddenEntry = entry.hiddenEntries[k];
                const hiddenWavFilePath = path.normalize(`${os.tmpdir()}/${baseName}.${j}.${k}.wav`);
                const hiddenMp4FilePath = path.normalize(`${os.tmpdir()}/${baseName}.${j}.${k}.m4a`);
                // Restoring RIFF in header because LBA format has 0 instead of first R
                if (game === 'LBA2') {
                    new Uint8Array(hiddenEntry.content)[0] = 0x52;
                }
                // Fixed VOC first byte
                if (game === 'LBA') {
                    new Uint8Array(hiddenEntry.content)[0] = 0x43;
                }
                fs.writeFileSync(hiddenWavFilePath, Buffer.from(hiddenEntry.content));

                await convertToM4aAudio(hiddenWavFilePath, hiddenMp4FilePath, bitrate);
                const hiddenMp4File = fs.readFileSync(hiddenMp4FilePath);
                const hiddenTgtEntry = new HQREntry(toArrayBuffer(hiddenMp4File), CompressionType.NONE);
                tgtEntry.hiddenEntries.push(hiddenTgtEntry);
                fs.unlinkSync(hiddenWavFilePath);
                fs.unlinkSync(hiddenMp4FilePath);

            }
        }

        const outputFile = `${folderPath}${nameOnly}_AAC.VOX`;
        fs.writeFileSync(outputFile, Buffer.from(hqrOut.toArrayBuffer()));
    }
};

const samplesConvertor = async (game) => {
    const filePath = path.normalize(`./www/data/${game}/SAMPLES.HQR`);
    const bitrate = readBitrateArguments();

    const file = fs.readFileSync(filePath);
    if (file == null) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const hqrIn = HQR.fromArrayBuffer(toArrayBuffer(file));
    const hqrOut = new HQR();
    for (let i = 0; i < hqrIn.entries.length; i += 1) {
        const entry = hqrIn.entries[i];
        if (!entry) {
            hqrOut.entries.push(null);
            console.log(`Skipping HQR entry #${i}`);
            continue;
        }
        if (entry instanceof HQRVirtualEntry) {
            console.log(`Copying HQR virtual entry #${i}`);
            hqrOut.entries.push(new HQRVirtualEntry(hqrOut, entry.target, entry.metadata));
            continue;
        }
        console.log(`Processing HQR entry #${i}`);
        const ext = game === 'LBA2' ? 'wav' : 'voc';
        const wavFilePath = path.normalize(`${os.tmpdir()}/SAMPLE_${i}.${ext}`);
        const mp4FilePath = path.normalize(`${os.tmpdir()}/SAMPLE_${i}.m4a`);

        const buffer = Buffer.from(entry.content);
        // Restoring RIFF in header because LBA format has 0 instead of first R
        if (game === 'LBA2') {
            buffer[0] = 0x52;
        }
        // Fixed VOC first byte
        if (game === 'LBA') {
            buffer[0] = 0x43;
        }
        fs.writeFileSync(wavFilePath, buffer);

        await convertToM4aAudio(wavFilePath, mp4FilePath, bitrate);
        const mp4File = fs.readFileSync(mp4FilePath);
        const tgtEntry = new HQREntry(toArrayBuffer(mp4File), CompressionType.NONE);
        hqrOut.entries.push(tgtEntry);
        fs.unlinkSync(wavFilePath);
        fs.unlinkSync(mp4FilePath);
    }

    const outputFile = path.normalize(`./www/data/${game}/SAMPLES_AAC.HQR`);
    fs.writeFileSync(outputFile,  Buffer.from(hqrOut.toArrayBuffer()));
};

const convertToM4aAudio = async (inputFilePath: string, outputFilePath: string, bitrate: number) => {
    console.log(`Converting ${inputFilePath} to ${outputFilePath} with bitrate ${bitrate}k`);
    removeFile(outputFilePath);
    FFmpeg.runSync(`-i "${inputFilePath}" -af afftdn,anlmdn=s=7:p=0.002:r=0.002:m=15 -c:a aac -b:a ${bitrate}k "${outputFilePath}"`);
};

const convertToWavAudio = async (inputFilePath: string, outputFilePath: string) => {
    console.log(`Converting ${inputFilePath} to ${outputFilePath}`);
    removeFile(outputFilePath);
    FFmpeg.runSync(`-i "${inputFilePath}" -c:a pcm_s16le "${outputFilePath}"`);
};

const convertors = {
    video: videoConvertor,
    music: musicConvertor,
    voice: voiceConvertor,
    samples: samplesConvertor,
};

const convert = () => {
    const gameFolder = process.argv[2];
    const version = detectVersion(gameFolder, null);
    const { game } = PathDefinitions[version];
    const convertorName = process.argv[3];
    if (!convertorName) {
        console.error(`Please provide argument for convertor. Supported: ${Object.keys(convertors)}`);
        return;
    }
    const convertor = convertors[convertorName];
    if (!convertor) {
        console.error(`Not supported convertor type: ${convertorName}; Supported: ${Object.keys(convertors)}`);
        return;
    }
    convertor(game);
};

convert();
