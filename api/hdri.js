import fs from 'fs';

export function getHDRIList(req, res) {
    fs.readdir('./www/data/hdr', (err, files) => {
        const hdriList = files.filter(file => file.endsWith('.hdr') || file.endsWith('.exr'));
        res.send(hdriList);
    });
}
