// This script is responsible to unpack the game files from the real game installation
// It is supposed to support Steam and GoG versions on MacOS, Windows and Linux

// TODO - make it work with Steam version
// TODO - make it work on Windows with GoG and Steam, in Powershell and WSL

// tslint:disable: no-console
// tslint:disable: max-line-length => only for ffmpeg commands that look ugly if splitting them too much
import fs from 'fs';
import path from 'path';
import { createFolderIfNotExists } from '../fsutils';
// import { exec } from 'child_process';

interface Paths {
    image: string;
    track: string;
    dosbox: string;
    unpack: string;
}

const unpack = (gameFolder: string) => {
    createFolderIfNotExists('./www/data');
    // gameFolder = addEndSlashIfAbsent(gameFolder); // TODO

    const paths: Paths = findFiles(gameFolder);
    if (!paths) {
        return;
    }
    const workDir = './www/data/_unpack/';
    const workPaths = copyInputFiles(workDir, paths);
    const imageDir = extractImage(workDir, workPaths);
    console.log(imageDir);

    // TODO -  copy all needed files from extracted image
    // TODO - copy track file
    // TODO - delete temporary folder (with rm -rf command )
};

const findFiles = (gameFolder: string) => {
    const result = {
        image: `${gameFolder}Contents/Resources/game/LBA2.GOG`,
        track: `${gameFolder}Contents/Resources/game/LBA2.OGG`,
        dosbox: `${gameFolder}Contents/Resources/dosbox/dosbox`,
        unpack: './src/utils/convert/unpack.bat'
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

const extractImage = (workDir: string, paths: Paths) => {
    const outputDir = `${workDir}data`;
    createFolderIfNotExists(outputDir);

    // TODO - remove paths if not used?
    console.log(paths);

};

unpack("/Applications/Little Big Adventure 2 (Twinsen's Odyssey).app/");
