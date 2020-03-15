// This script is responsible to unpack the game files from the real game installation
// It is supposed to support Steam and GoG versions on MacOS, Windows and Linux

// TODO - make it work with Steam version
// TODO - make it work on Windows with GoG and Steam, in Powershell and WSL

// tslint:disable: no-console
// tslint:disable: max-line-length
import fs from 'fs';
import path from 'path';
import { createFolderIfNotExists, executeCommand } from '../fsutils';

interface Paths {
    image: string;
    track: string;
    dosbox: string;
    unpack: string;
}

const SupportedVersions = ['GogWin', 'GogMac'];

const PathDefinitions = {
    GogWin: {
        image: 'LBA2.GOG',
        track: 'LBA2.OGG',
        dosbox: 'DOSBOX/DOSBox.exe'
    },
    GogMac: {
        image: 'Contents/Resources/game/LBA2.GOG',
        track: 'Contents/Resources/game/LBA2.OGG',
        dosbox: 'Contents/Resources/dosbox/dosbox'
    }
};

const UnpackCommands = {
    'GogWin': 'DOSBox.exe',
    'GogMac': 'dosbox'
};

const unpack = async (gameFolder: string) => {
    const version = detectVersion(gameFolder);
    if (!version) {
        return null;
    }
    const paths: Paths = findFiles(gameFolder, version);
    if (!paths) {
        return;
    }

    createFolderIfNotExists('./www/data');
    const workDir = './www/data/_unpack/';
    const localPaths = copyInputFiles(workDir, paths);
    console.log('Extracting image. Do not close the dosbox window.');
    await extractImage(workDir, version);
    fs.copyFileSync(localPaths.track, './www/data/MUSIC/LBA2.OGG');
    await executeCommand(`rm -rf "${workDir}"`);
};

const findFiles = (gameFolder: string, version: string) => {
    const result = {
        image: path.join(gameFolder, PathDefinitions[version].image),
        track: path.join(gameFolder, PathDefinitions[version].track),
        dosbox: path.join(gameFolder, PathDefinitions[version].dosbox),
        unpack: path.join(__dirname, 'unpack.bat')
    };
    return verifyPaths(result);
};

const detectVersion = (gameFolder: string) => {
    for (let i = 0; i < SupportedVersions.length; i += 1) {
        const version = SupportedVersions[i];
        const imagePath = path.join(gameFolder, PathDefinitions[version].image);
        if (fs.existsSync(imagePath)) {
            console.log(`Detected game instalation: ${version}`);
            return version;
        }
    }
    console.error('Unsupported game installation. Currenttly supported GoG versions for windows and mac. '+
        'Make sure you specified the correct folder path with installed LBA 2 game. If you verified it is correct, then ' +
        'most probably you can still run the remake, but you will have to copy the game files manually. Refer to the README.md');
    return null;
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

const extractImage = async (workDir: string, version: string) => {
    await executeCommand(`cd "${workDir}" && ./${UnpackCommands[version]} unpack.bat -exit`);
};

const readGameFolderFromArguments = () => {
    if (process.argv.length < 3) {
        throw 'Please specify game folder';
    }
    return process.argv[2];
};

unpack(readGameFolderFromArguments());
