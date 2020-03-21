// tslint:disable: no-console
import fs from 'fs';
import { exec } from 'child_process';

export const createFolderIfNotExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
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
