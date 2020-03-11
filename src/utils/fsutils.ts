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
