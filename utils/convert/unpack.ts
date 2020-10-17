// This script is responsible to unpack the game files from the real game installation
// It supports Steam and GoG versions on MacOS and Windows

// tslint:disable: no-console
// tslint:disable: max-line-length
import fs from 'fs';
import path from 'path';

import { createFolderIfNotExists, executeCommand, removeDirectoryRecursive, copyFolderSync } from '../../src/utils/fsutils';

interface Paths {
    image: string;
    track: string;
    dosbox: string;
    unpack: string;
}

const SupportedVersions = ['GogWin', 'SteamWin', 'GogMac', 'GogMacStandalone', 'GogWinLBA1', 'SteamWinLBA1', 'GogMacLBA1', 'GogMacStandaloneLBA1'];

export const PathDefinitions = {
    // LBA2
    GogWin: {
        game: 'LBA2',
        image: 'LBA2.GOG',
        track: 'LBA2.OGG',
        dosbox: ['DOSBOX/DOSBox.exe', 'DOSBOX/SDL.dll', 'DOSBOX/SDL_net.dll']
    },
    SteamWin: {
        game: 'LBA2',
        image: 'LBA2.DOT',
        track: 'LBA2.OGG',
        dosbox: ['DOSBOX/DOSBox.exe', 'DOSBOX/SDL.dll', 'DOSBOX/SDL_net.dll']
    },
    GogMac: {
        game: 'LBA2',
        image: 'Contents/Resources/game/LBA2.GOG',
        track: 'Contents/Resources/game/LBA2.OGG',
        dosbox: ['Contents/Resources/dosbox/dosbox']
    },
    GogMacStandalone: {
        game: 'LBA2',
        image: 'Contents/Resources/Little Big Adventure 2.boxer/D.cdmedia/LBA2.GOG',
        track: 'Contents/Resources/Little Big Adventure 2.boxer/D.cdmedia/LBA2.OGG',
        dosbox: ['Contents/MacOS/DOSBox'],
        externalDosbox: true
    },
    // LBA1
    GogWinLBA1: {
        game: 'LBA',
        image: 'LBA.GOG',
        track: null,
        vox: 'VOX',
        dosbox: ['DOSBOX/DOSBox.exe', 'DOSBOX/SDL.dll', 'DOSBOX/SDL_net.dll']
    },
    SteamWinLBA1: {
        game: 'LBA',
        image: 'LBA.DOT',
        track: null,
        vox: 'VOX',
        dosbox: ['DOSBOX/DOSBox.exe', 'DOSBOX/SDL.dll', 'DOSBOX/SDL_net.dll']
    },
    GogMacLBA1: {
        game: 'LBA',
        image: 'Contents/Resources/game/LBA.GOG',
        track: null,
        vox: 'Contents/Resources/game/VOX',
        dosbox: ['Contents/Resources/dosbox/dosbox']
    },
    GogMacStandaloneLBA1: {
        game: 'LBA',
        image: 'Contents/Resources/Little Big Adventure.boxer/D.cdmedia/LBA.GOG',
        track: null,
        vox: 'Contents/Resources/Little Big Adventure.boxer/D.cdmedia/VOX',
        dosbox: ['Contents/MacOS/DOSBox'],
        externalDosbox: true
    }
};

const UnpackCommands = {
    GogWin: 'powershell -File utils/convert/unpkLBA2.ps1',
    SteamWin: 'powershell -File utils/convert/unpkLBA2.ps1',
    GogMac: 'cd www/data/LBA2/_unpack && ./dosbox unpkLBA2.bat -exit',
    GogMacStandalone: 'cd www/data/LBA2/_unpack && ./dosbox unpkLBA2.bat -exit',
    GogWinLBA1: 'powershell -File utils/convert/unpkLBA.ps1',
    SteamWinLBA1: 'powershell -File utils/convert/unpkLBA.ps1',
    GogMacLBA1: 'cd www/data/LBA/_unpack && ./dosbox unpkLBA.bat -exit',
    GogMacStandaloneLB1: 'cd www/data/LBA/_unpack && ./dosbox unpkLBA.bat -exit'
};

interface UnpackOptions {
    gameFolder: string;
    dosboxFolder: string;
}

const unpack = async ({gameFolder, dosboxFolder}: UnpackOptions) => {
    const version = detectVersion(gameFolder, dosboxFolder);
    const { game, vox } = PathDefinitions[version];
    const paths: Paths = findFiles(gameFolder, dosboxFolder, version);
    if (!paths) {
        return;
    }

    createFolderIfNotExists(path.normalize(`./www/data/${game}`));
    const workDir = path.normalize(`./www/data/${game}/_unpack/`);
    createFolderIfNotExists(workDir);
    // createFolderIfNotExists(path.normalize(`${workDir}/VOX`));
    const localPaths = copyInputFiles(workDir, paths);
    console.log('Extracting image. Do not close the dosbox window.');
    await extractImage(version);
    if (localPaths.track) {
        fs.copyFileSync(localPaths.track[0], path.normalize(`./www/data/${game}/MUSIC/${game}.OGG`));
    }
    if (vox) {
        copyFolderSync(
            path.normalize(`${gameFolder}/${vox}`),
            path.normalize(`./www/data/${game}/VOX`),
        );
    }
    removeDirectoryRecursive(workDir);
};

const findFiles = (gameFolder: string, dosboxFolder: string, version: string) => {
    const versionGame = PathDefinitions[version];
    const result = {
        image: path.join(gameFolder, versionGame.image),
        track: versionGame.track !== null ? path.join(gameFolder, versionGame.track) : null,
        dosbox: versionGame.externalDosbox
            ? versionGame.dosbox.map((dbp: string) => path.join(dosboxFolder, dbp))
            : versionGame.dosbox.map((dbp: string) => path.join(gameFolder, dbp)),
        unpack: path.join(__dirname, `unpk${versionGame.game}.bat`)
    };
    return verifyPaths(result);
};

export const detectVersion = (gameFolder: string, dosboxFolder: string) => {
    for (let i = 0; i < SupportedVersions.length; i += 1) {
        const version = SupportedVersions[i];
        const imagePath = path.join(gameFolder, PathDefinitions[version].image);
        if (fs.existsSync(imagePath)) {
            console.log(`Detected game instalation: ${version}`);
            if (PathDefinitions[version].externalDosbox && !dosboxFolder) {
                console.error('This version requires to provide a path to an installation of dosbox as second argument.');
                process.exit(1);
            }
            return version;
        }
    }
    console.error('Unsupported game installation. Currently supported GoG versions for windows and mac. ' +
        'Make sure you specified the correct folder path with installed LBA 2 game. If you verified it is correct, then ' +
        'most probably you can still run the remake, but you will have to copy the game files manually. Refer to the README.md');
    process.exit(1);
};

const verifyPaths = (paths: Paths) => {
    let result: Paths = paths;
    Object.keys(paths).forEach((item) => {
        const inputPaths = Array.isArray(paths[item]) ? paths[item] : [paths[item]];
        for (let i = 0; i < inputPaths.length; i += 1) {
            const currentPath = inputPaths[i];
            if (currentPath && !fs.existsSync(currentPath)) {
                console.error(`Cannot find part of ${item} path: ${path}`);
                result = null;
                return;
            }
        }
    });
    return result;
};

const copyInputFiles = (workDir: string, paths: Paths) => {
    createFolderIfNotExists(workDir);
    const result = {};
    Object.keys(paths).forEach((item) => {
        let inputPaths = paths[item];
        if (!inputPaths) {
            return;
        }
        inputPaths = Array.isArray(inputPaths) ? inputPaths : [inputPaths];

        const localPaths = inputPaths.map((p: string) => `${workDir}${path.basename(p)}`);
        result[item] = localPaths;
        inputPaths.forEach((element: string, index: number) => {
            fs.copyFileSync(element, localPaths[index]);
        });
    });
    return result as Paths;
};

const extractImage = async (version: string) => {
    await executeCommand(UnpackCommands[version]);
};

const readGameFolderFromArguments = () => {
    if (process.argv.length < 3) {
        throw 'Please specify game folder';
    }
    return {
        gameFolder: process.argv[2],
        dosboxFolder: process.argv[3]
    };
};

unpack(readGameFolderFromArguments());
