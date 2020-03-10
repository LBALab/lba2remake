// This script is responsible to unpack the game files from the real game installation
// It is supposed to support Steam and GoG versions on MacOS, Windows and Linux

// tslint:disable: no-console
// tslint:disable: max-line-length => only for ffmpeg commands that look ugly if splitting them too much
import fs from 'fs';
import path from 'path';
// import { exec } from 'child_process';

interface Paths {
    image: string;
    track: string;
    dosbox: string;
}

const unpack = (gameFolder: string) => {
    // gameFolder = addEndSlashIfAbsent(gameFolder); // TODO
    const paths: Paths = findFiles(gameFolder);
    if (!paths) {
        return;
    }
    const workDir = './www/data/_unpack/';
    copyInputFiles(workDir, paths);
};

const findFiles = (gameFolder: string) => {
    const result = {
        image: `${gameFolder}Contents/Resources/game/LBA2.GOG`,
        track: `${gameFolder}Contents/Resources/game/LBA2.OGG`,
        dosbox: `${gameFolder}Contents/Resources/dosbox/dosbox`,
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
    if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir);
    }

    Object.keys(paths).forEach((item) => {
        const inputPath = paths[item];
        if (!inputPath) {
            return;
        }
        fs.copyFileSync(inputPath, `${workDir}${path.basename(inputPath)}`);
    });
};

unpack("/Applications/Little Big Adventure 2 (Twinsen's Odyssey).app/");
