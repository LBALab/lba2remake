import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { startNewJob } from './jobs.js';
import downloadsFolderFn from 'downloads-folder';

const downloadsFolder = downloadsFolderFn();

export function bake(req, res) {
    const { type, game, name } = req.params;
    const { steps, samples, textureSize, margin, denoise, dumpAfter, hdri, hdriRotation, hdriExposure } = req.query;
    const tmpDir = os.tmpdir();
    const inputFile = path.join(tmpDir, `${name}.glb`);
    const targetDir = type === 'island'
        ? path.normalize(`www/models/${game}/islands`)
        : path.normalize(`www/models/${game}/iso_scenes`);
    const outputFile = path.join(process.cwd(), targetDir, `${name}.glb`);
    const dumpFile = path.join(downloadsFolder, `${name}.blend`);
    req.pipe(fs.createWriteStream(inputFile));
    req.on('end', () => {
        let bl = null;
        let cancelled = false;
        const jobId = startNewJob((resove, reject, progress) => {
            console.log(`[JOB:${jobId}][START]: FILE=${inputFile}`);
            const blenderArgs = ['-b', '-P', 'utils/blender/bake.py', '--'];
            const scriptArgs = [
                '--input', inputFile,
                '--output', outputFile,
                '--steps', steps || 'import,bake,apply,export',
                '--samples', samples || 64,
                '--textureSize', textureSize || 512,
                '--margin', margin || 2,
                '--denoise', denoise || 'FAST',
            ];
            if (hdri) {
                scriptArgs.push('--hdri', path.join(process.cwd(), 'www/data/hdr', hdri));
                scriptArgs.push('--hdriRotation', hdriRotation || 0);
                scriptArgs.push('--hdriExposure', hdriExposure || 1);
            }
            if (dumpAfter) {
                scriptArgs.push('--dumpAfter', dumpAfter);
                scriptArgs.push('--dumpFile', dumpFile);
            }
            const blenderPath = process.env.BLENDER_EXEC_PATH;
            bl = spawn(blenderPath, [...blenderArgs, ...scriptArgs]);
            bl.stdout.on('data', (data) => {
                data.toString().split('\n').forEach((line) => {
                    if (line.startsWith('[PROGRESS]:')) {
                        const content = line.slice('[PROGRESS]:'.length)
                        const [stage, rawValue, details] = content.split(':');
                        const value = parseFloat(rawValue) || 0;
                        const fValue = rawValue !== undefined ? ` ${Math.round(value * 100)}%` : '';
                        const fDetails = details ? ` (${details})` : ''
                        console.log(`[JOB:${jobId}][PROGRESS]: ${stage}${fValue}${fDetails}`);
                        progress({stage, value, details });
                    } else if (line.startsWith('[INFO]:')) {
                        const content = line.slice('[INFO]:'.length)
                        console.log(`[JOB:${jobId}][INFO]: ${content}`);
                    }
                });
            });

            const errors = [];
            bl.stderr.on('data', (data) => {
                const content = data.toString();
                console.error(`[JOB:${jobId}][ERROR]: ${content}`);
                errors.push(content);
            });

            bl.on('close', (code) => {
                if (code === 0 && errors.length === 0) {
                    console.error(`[JOB:${jobId}][DONE]`);
                    resove();
                } else {
                    if (cancelled) {
                        console.error(`[JOB:${jobId}][CANCELLED]`);
                        reject(new Error('Cancelled'));
                    } else {
                        console.error(`[JOB:${jobId}][FAILED]`);
                        const fErrors = errors.length > 0 ? `, errors=${errors.join('\n')}` : '.';
                        reject(new Error(`Blender exited with code ${code}${fErrors}`));
                    }
                }
            });
        }, () => {
            if (bl) {
                cancelled = true;
                bl.kill();
            }
        });
        res.send({
            jobId
        });
    });
    req.on('error', (err) => {
        res.status(500).send({
            error: err.message
        });
    });
}
