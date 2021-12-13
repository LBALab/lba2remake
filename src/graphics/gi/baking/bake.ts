import { getParams } from '../../../params';
import { bakeIsland } from './bake_island';

export interface BakeProgress {
    stage: string;
    value: number;
    duration?: number;
    stageStartTime?: number;
    cancelled: boolean;
    details?: string;
}

export interface ProgressHandler {
    done: () => void;
    cancel: () => void;
    progress: (value: number, details?: string) => void;
}

export interface BakeParams {
    textureSize: number;
    samples: number;
    margin: number;
    denoise: 'NONE' | 'FAST' | 'ACCURATE';
    dumpAfter: 'none' | 'import' | 'bake' | 'denoise' | 'apply';
    hdri?: string;
    hdriRotation: number;
    hdriExposure: number;
}

export interface BakeState extends BakeParams {
    cancelled: boolean;
    startProgress: (name: string, details?: string) => ProgressHandler;
}

export interface BakeObject {
    type: 'island' | 'iso_scene';
    glb: ArrayBuffer;
    name: string;
}

export async function bake(params: BakeState) {
    const island = DebugData.scope.island;
    if (island) {
        const obj = await bakeIsland(island.name, params);
        if (params?.cancelled)
            throw new Error('Cancelled');
        await bakeObject(obj, params);
    } else {
        // TODO: bake iso scene
    }
}

async function bakeObject(obj: BakeObject, params: BakeState) {
    let p = params.startProgress('Uploading');
    const { game } = getParams();
    const q = [];
    for (const opt of ['textureSize', 'samples', 'margin', 'denoise', 'dumpAfter', 'hdri', 'hdriRotation', 'hdriExposure']) {
        if (params[opt] !== undefined)
            q.push(`${opt}=${params[opt]}`);
    }
    const url = `/api/bake/${obj.type}/${game}/${obj.name}?${q.join('&')}`;
    const { jobId } = await fetch(url, {
        method: 'POST',
        body: obj.glb,
    }).then(res => res.json());
    let offset = 0;
    let currentStage;
    while (true) {
        if (params.cancelled) {
            await fetch(`/api/job/${jobId}`, {
                method: 'DELETE',
            });
            throw new Error('Cancelled');
        }
        const job = await fetch(`/api/job/${jobId}?offset=${offset}`)
            .then(res => res.json());
        for (const prog of job.progress) {
            if (prog.stage !== currentStage) {
                p?.done();
                p = params.startProgress(prog.stage, prog.details);
                currentStage = prog.stage;
            } else {
                p?.progress(prog.value, prog.details);
            }
        }
        offset += job.progress.length;
        if (job.status === 'done' || job.status === 'error') {
            if (job.status === 'error') {
                p?.cancel();
                throw new Error(job.error);
            }
            p?.done();
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
