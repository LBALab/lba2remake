// This script is responsible to unpack the game files from the real game installation
// It is supposed to support Steam and GoG versions on MacOS, Windows and Linux

// TODO - make it work with Steam version
// TODO - make it work on Windows with GoG and Steam, in Powershell and WSL

// tslint:disable: no-console
// tslint:disable: max-line-length => only for ffmpeg commands that look ugly if splitting them too much
import fs from 'fs';
import path from 'path';
import { createFolderIfNotExists, executeCommand } from '../fsutils';

interface Paths {
    image: string;
    track: string;
}

const unpack = async (gameFolder: string) => {
    createFolderIfNotExists('./www/data');

    const paths: Paths = findFiles(gameFolder);
    if (!paths) {
        return;
    }
    const workDir = './www/data/_unpack/';
    const localPaths = copyInputFiles(workDir, paths);
    console.log('Extracting image. Do not close the dosbox window.');
    await extractImage(workDir);
    fs.copyFileSync(localPaths.track, './www/data/MUSIC/LBA2.OGG');
    await executeCommand(`rm -rf "${workDir}"`);
};

const findFiles = (gameFolder: string) => {
    const result = {
        image: path.join(gameFolder, 'Contents/Resources/game/LBA2.GOG'),
        track: path.join(gameFolder, 'Contents/Resources/game/LBA2.OGG'),
        dosbox: path.join(gameFolder, 'Contents/Resources/dosbox/dosbox'),
        unpack: path.join(__dirname, 'unpack.bat')
    };
    return verifyPaths(result);
};

const verifyPaths = (paths: Paths) => {
    let result: Paths = paths;
    Object.keys(paths).forEach((item) => {
        if (!fs.existsSync(paths[item])) {
            console.error(`Cannot find ${item} path: ${paths[item]}`);
            result = null;
            return;
        }
    });
    return result;
};

const copyInputFiles = (workDir: string, paths: Paths) => {
    createFolderIfNotExists(workDir);
    const result = {};
    Object.keys(paths).forEach((item) => {
        const inputPath = paths[item];
        if (!inputPath) {
            return;
        }
        const localPath = `${workDir}${path.basename(inputPath)}`;
        result[item] = localPath;
        fs.copyFileSync(inputPath, localPath);
    });
    return result as Paths;
};

const extractImage = async (workDir: string) => {
    await executeCommand(`cd "${workDir}" && ./dosbox unpack.bat -exit`);
};

const readGameFolderFromArguments = () => {
    if (process.argv.length < 3) {
        throw 'Please specify game folder';
    }
    return process.argv[2];
};

unpack(readGameFolderFromArguments());
