import {loadBricksMapping} from './mapping';
import { getLibraries } from '../../../resources';

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
    if (!globalGridMetadata) {
        const metadataReq = await fetch('/metadata/grids.json');
        globalGridMetadata = await metadataReq.json();
    }
    // [entry - 1] is the scene index.
    // It's easier for humans to deal with scene numbers than grid entry
    // numbers when manually editing the grids.json file.
    return globalGridMetadata[entry - 1];
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
