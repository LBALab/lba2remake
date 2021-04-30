import {loadBricksMapping} from './mapping';
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

export async function hideBrick(entry, isoGrid, brick) {
    if (!(entry in globalGridMetadata)) {
        globalGridMetadata[entry] = {};
    }
    const gridMetadata = globalGridMetadata[entry];
    let hide = true;
    if (brick in gridMetadata) {
        const info = gridMetadata[brick];
        if (info.hide) {
            delete gridMetadata[brick];
            hide = false;
        } else {
            gridMetadata[brick] = { hide: true };
        }
    } else {
        gridMetadata[brick] = { hide: true };
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
