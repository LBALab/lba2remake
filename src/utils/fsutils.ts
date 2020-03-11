import fs from 'fs';

export const createFolderIfNotExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
};
