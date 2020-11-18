// tslint:disable: no-console
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const createFolderIfNotExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

export const executeCommand = async (cmd: string) => {
    return new Promise((resolve) => {
        exec(cmd, (error, _stdout, stderr) => {
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

export const removeFile = (filename) => {
    if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
    }
};

export const removeDirectoryRecursive = async (workDir) => {
    let rmCommand = 'rm -rf';
    if (process.platform === 'win32') {
        rmCommand = 'rmdir /s /q';
    }
    await executeCommand(`${rmCommand} "${workDir}"`);
};

export const copyFolderSync = (from, to) => {
    createFolderIfNotExists(to);
    fs.readdirSync(from).forEach((file) => {
        if (fs.lstatSync(path.join(from, file)).isFile()) {
            fs.copyFileSync(path.join(from, file), path.join(to, file));
        } else {
            copyFolderSync(path.join(from, file), path.join(to, file));
        }
    });
};
