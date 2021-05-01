import * as THREE from 'three';
import { loadBricksMapping } from './mapping';
import { getLibraries } from '../../../resources';
import { getParams } from '../../../params';

export enum GROUND_TYPES {
    NORMAL_FLOOR,
    WATER,
    UNUSED,
    ESCALATOR_BOTTOM_RIGHT_TOP_LEFT,
    ESCALATOR_TOP_LEFT_BOTTOM_RIGHT,
    ESCALATOR_BOTTOM_LEFT_TOP_RIGHT,
    ESCALATOR_TOP_RIGHT_BOTTOM_LEFT,
    DOME_OF_THE_SLATE_FLOOR,
    CAVE_SPIKES,
    LAVA,
    NORMAL_FLOOR2,
    GAS,
    UNUSED2,
    LAVA2,
    GAS2,
    WATER2,
}

let globalGridMetadata = null;

export async function getGridMetadata(entry) {
    const { game } = getParams();
    if (!globalGridMetadata) {
        const metadataReq = await fetch(`/metadata/${game}/grids.json`);
        globalGridMetadata = await metadataReq.json();
    }
    return globalGridMetadata[entry];
}

let saveTimeout = null;

export function hideBrick(gridIndex, isoGrid, brick) {
    if (!(gridIndex in globalGridMetadata)) {
        globalGridMetadata[gridIndex] = { models: [], patches: {} };
    }
    const gridPatches = globalGridMetadata[gridIndex].patches;
    let hide = true;
    if (brick in gridPatches) {
        const info = gridPatches[brick];
        if (info.hide) {
            delete gridPatches[brick];
            hide = false;
        } else {
            gridPatches[brick] = { hide: true };
        }
    } else {
        gridPatches[brick] = { hide: true };
    }
    const editorData = isoGrid.editorData;
    const key = brick.replaceAll('x', ',');
    if (editorData.bricksMap.has(key)) {
        const brickData = editorData.bricksMap.get(key);
        const flagAttr = editorData.bricksGeom.attributes.flag;
        for (let i = brickData.start; i < brickData.end; i += 1) {
            flagAttr.array[i] = hide ? 2 : 0;
        }
        flagAttr.needsUpdate = true;
    }
    saveGridMetadataChanges();
}

export function updateGridExtraModels(gridIndex: number, models: Set<THREE.Object3D>) {
    if (!(gridIndex in globalGridMetadata)) {
        globalGridMetadata[gridIndex] = { models: [], patches: {} };
    }
    const { game } = getParams();
    globalGridMetadata[gridIndex].models = Array.from(models).map((model) => {
        return {
            file: `/models/${game}/layouts/${model.name}`,
            position: model.position,
            quaternion: model.quaternion
        };
    });
    saveGridMetadataChanges();
}

function saveGridMetadataChanges() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(async () => {
        try {
            await fetch(`/grid_metadata/${getParams().game}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/octet-stream'
                },
                body: JSON.stringify(globalGridMetadata, null, 4)
            });
            // tslint:disable-next-line: no-console
            console.log('Saved grid metadata');
        } catch (err) {
            // tslint:disable-next-line: no-console
            console.warn('Failed to save grid metadata:', err);
        }
    }, 1000);
}

const libraries = [];

export async function loadLibrary(bricks, mask, palette, entry) {
    if (libraries[entry]) {
        return libraries[entry];
    }
    const layouts = await getLibraries(entry);
    const mapping = loadBricksMapping(layouts, bricks, mask, palette);
    const library = {
        index: entry,
        texture: mapping.texture,
        bricksMap: mapping.bricksMap,
        layouts
    };
    libraries[entry] = library;
    return library;
}
