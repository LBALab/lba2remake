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

export async function suppressBrickMD(entry, brick) {
    if (!(entry in globalGridMetadata)) {
        globalGridMetadata[entry] = {};
    }
    globalGridMetadata[entry][brick] = { layout: -1 };
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
