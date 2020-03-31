
import HQR, { loadHqr } from '../hqr';

const ResourceStrategyType = {
    TRANSIENT: 0,
    STATIC: 1,
};

const HQRExtensions = [
    '.HQR',
    '.VOX',
    '.ILE',
    '.OBL',
    '.zip',
];

const ResourceType = {
    NONE: 0,
    ANIM: 1,
    BODY: 2,
    RESS: 3,
    SAMPLES: 4,
    SCENE: 5,
    SPRITES: 6,
    SPRITERAW: 7,
    TEXT: 8,
    OBJECTS: 9,
    LAYOUTS: 10,
    BRICKS: 11,
    GRIDS: 12,
    MUSIC: 13,
    LOGO: 14,
    THEME_ADELINE: 15,
    THEME_MAIN: 16,
    THEME_MENU: 17,
    MUSIC_TRACK_1: 18,
    VOICES_GAM: 19,
    VOICES_000: 20,
    VOICES_001: 21,
    VOICES_002: 22,
    VOICES_003: 23,
    VOICES_004: 24,
    VOICES_005: 25,
    VOICES_006: 26,
    VOICES_007: 27,
    VOICES_008: 28,
    VOICES_009: 29,
    VOICES_010: 30,
    VOICES_011: 31,
    ASCENCE_ILE: 32,
    ASCENCE_OBL: 33,
    CELEBRA2_ILE: 34,
    CELEBRA2_OBL: 35,
    CELEBRAT_ILE: 36,
    CELEBRAT_OBL: 37,
    CITABAU_ILE: 38,
    CITABAU_OBL: 39,
    CITADEL_ILE: 40,
    CITADEL_OBL: 41,
    DESERT_ILE: 42,
    DESERT_OBL: 43,
    EMERAUDE_ILE: 44,
    EMERAUDE_OBL: 45,
    ILOTCX_ILE: 46,
    ILOTCX_OBL: 47,
    KNARTAS_ILE: 48,
    KNARTAS_OBL: 49,
    MOON_ILE: 50,
    MOON_OBL: 51,
    MOSQUIBE_ILE: 52,
    MOSQUIBE_OBL: 53,
    OTRINGAL_ILE: 54,
    OTRINGAL_OBL: 55,
    PLATFORM_ILE: 56,
    PLATFORM_OBL: 57,
    SOUSCELB_ILE: 58,
    SOUSCELB_OBL: 59,
    ENTITIES: 60,
    PALETTE: 61,
    MENU_BACKGROUND: 62,
    VIDEO_ASCENSEU: 63,
    VIDEO_ASRETOUR: 64,
    VIDEO_BALDINO: 65,
    VIDEO_BOAT1: 66,
    VIDEO_BOAT2: 67,
    VIDEO_BOAT3: 68,
    VIDEO_BOAT4: 69,
    VIDEO_BU: 70,
    VIDEO_CRASH: 71,
    VIDEO_DARK: 72,
    VIDEO_DELUGE: 73,
    VIDEO_END: 74,
    VIDEO_END2: 75,
    VIDEO_ENFA: 76,
    VIDEO_FRAGMENT: 77,
    VIDEO_GROTTE: 78,
    VIDEO_INTRO: 79,
    VIDEO_LUNES1: 80,
    VIDEO_LUNES2: 81,
    VIDEO_MONTCH: 82,
    VIDEO_MOON: 83,
    VIDEO_PASSEUR: 84,
    VIDEO_PUB1: 85,
    VIDEO_PUB2: 86,
    VIDEO_PUB3: 87,
    VIDEO_PUB4A6: 88,
    VIDEO_SENDELL: 89,
    VIDEO_SORT: 90,
    VIDEO_SURSAUT: 91,
    VIDEO_TAXI: 92,
    VIDEO_TAXI_J: 93,
    VIDEO_VOYAGEZ: 94,
    VIDEO_ZEELP: 95,
    VIDEO_BABY: 96,
    VIDEO_INTRO_EN: 97,
    VIDEO_INTRO_FR: 98,
    VIDEO_INTRO_DE: 99,
};

const ResourceName = [
    'None',
    'Animations',
    '3d Models',
    'Global Resources',
    'Samples',
    'Scenes',
    'Sprites',
    'Raw Sprites',
    'Text Dialogues',
    'Inventory Objects',
    'Isometric Layouts',
    'Isometric Bricks',
    'Isometric Grids',
    'Music',
    'LBA Logo',
    'Adeline Theme Song', // 15
    'LBA Theme Short Version',
    'LBA Theme',
    'Citadel Music Scene',
    'Main Game Voices',
    'Voices 0',
    'Voices 1',
    'Voices 2',
    'Voices 3',
    'Voices 4',
    'Voices 5',
    'Voices 6',
    'Voices 7',
    'Voices 8',
    'Voices 9',
    'Voices 10', // 30
    'Voices 11',
    'Undergas Elevator',
    'Undergas Elevator Objects',
    'Celebration Island Statue Emerged',
    'Celebration Island Statue Emerged Objects',
    'Celebration Island',
    'Celebration Island Objects',
    'Citadel Island',
    'Citadel Island Objects',
    'Citadel Island Storm',
    'Citadel Island Storm Objects',
    'Desert Island',
    'Desert Island Objects',
    'Emerald Moon',
    'Emerald Moon Objects', // 45
    'Island CX',
    'Island CX Objects',
    'Francos Island',
    'Francos Island Objects',
    'Emerald Moon 2',
    'Emerald Moon 2 Objects',
    'Mosquibees Island',
    'Mosquibees Island Objects',
    'Otringal',
    'Otringal Objects',
    'Wannies Island',
    'Wannies Island Objects',
    'Volcano Island',
    'Volcano Island Objects',
    '3D Animation & Model Entites', // 60
    'Main Palette',
    'Menu Background Image',
    'Undergas Going Down',
    'Undergas Going Up',
    'Baldino',
    'Boat',
    'Boat',
    'Boat',
    'Boat',
    'Temple of Bù',
    'Crash',
    'Dark Monk Statue Rises',
    'Bad Ending',
    'The End',
    'The End', // 75
    'ENFA',
    'Wannies Fragment',
    'Citadel Cliffs',
    'Intro Sequence',
    'Emerald Moon Moves',
    'Emeral Moon Moves',
    'MONTCH',
    'Emerald Moon',
    'Ferryman',
    'PUB1',
    'PUB2',
    'PUB3',
    'PUB4A6',
    'Sendell\'s Ball',
    'SORT', // 90
    'SURSAUT',
    'TAXI',
    'TAXI_J',
    'VOYAGEZ',
    'Zeelich',
    'Baby Ending',
    'Intro Sequence',
    'Intro Sequence',
    'Intro Sequence',
];

interface Resource {
    id: number;
    refId: number;
    type: number;
    name: string;
    path: string;
    length: number;
    index: number;
    loaded: boolean;
    isHQR: boolean;
    hqr: HQR;
    getBuffer: Function;
    getBufferUint8: Function;
    getEntry: Function;
    getEntryAsync: Function;
    hasHiddenEntries: Function;
    load: Function;
}

let Resources: Resource | {} = { };

// TODO normalise this preload function using new Web Api wrapper
const preloadResource = async (url, name, mandatory = true) => {
    const send = (eventName, progress?) => {
        if (name) {
            document.dispatchEvent(new CustomEvent(eventName, {detail: {name, progress}}));
        }
    };
    return new Promise((resolve: Function, reject: Function) => {
        send('loaderprogress', 0);
        const request = new XMLHttpRequest();
        request.open('GET', `data/${url}`, true);
        request.responseType = 'arraybuffer';
        request.onprogress = (event) => {
            const progress = event.loaded / event.total;
            send('loaderprogress', progress);
        };
        request.onload = function onload() {
            if (!mandatory && this.status === 404) {
                resolve();
            }
            if (this.status === 200) {
                send('loaderend');
                resolve();
            } else {
                reject(`Failed to load resource: status=${this.status}`);
            }
        };
        request.onerror = (err) => {
            reject(err);
        };
        request.send();
    });
};

/** Add Resource */
const registerResource = (
    type: number,
    id: number,
    path: string,
    entryIndex: number,
) => {
    if (Resources[id]) {
        return;
    }

    const resource = {
        id,
        type,
        name: ResourceName[id],
        path,
        index: entryIndex,
        loaded: false,
        // HQR, VOX, ILE, OBL, ZIP (OpenHQR)
        isHQR: new RegExp(HQRExtensions.join('|')).test(path),
        hqr: null,
        getBuffer: null,
        getBufferUint8: null,
        getEntry: null,
        getEntryAsync: null,
        load: null,
        length: 0,
        hasHiddenEntries: null,
        refId: null,
    };

    // check if we have already a resource with same file
    // reuse the file to have a single file loaded in memory
    // but keep reference to this resource
    // for (const res of Object.values(Resources)) {
    //     if (res.path === path) {
    //         resource.refId = res.id;
    //         break;
    //     }
    // }

    resource.getBuffer = () => {
        if (resource.refId) {
            if (resource.index >= 0) {
                return Resources[resource.refId].getEntry(resource.index);
            }
            return Resources[resource.refId].getBuffer();
        }
        if (resource.index >= 0) {
            return resource.hqr.getEntry(resource.index);
        }
        return resource.hqr.getBuffer();
    };

    resource.getBufferUint8 = () => {
        return new Uint8Array(resource.getBuffer());
    };

    resource.getEntry = (index: number) => {
        if (resource.refId) {
            return Resources[resource.refId].getEntry(index);
        }
        return resource.hqr.getEntry(index);
    };

    resource.hasHiddenEntries = (index: number) => {
        return resource.hqr.hasHiddenEntries(index);
    };

    resource.getEntryAsync = async (index: number) => {
        if (resource.refId) {
            return Resources[resource.refId].getEntryAsync(index);
        }
        return await resource.hqr.getEntryAsync(index);
    };

    resource.load = async () => {
        if (resource.refId) {
            resource.length = Resources[resource.refId].length;
            resource.loaded = Resources[resource.refId].loaded;
            return;
        }
        resource.hqr = await loadHqr(resource.path);
        resource.length = resource.hqr.length;
        resource.loaded = true;
    };

    Resources[id] = resource;
};

const registerStaticResource = (
    id: number,
    path: string,
    index: number = null,
) => {
    registerResource(ResourceStrategyType.STATIC, id, path, index);
};

const registerTransientResource = (
    id: number,
    path: string,
    index: number = null,
) => {
    registerResource(ResourceStrategyType.TRANSIENT, id, path, index);
};

const releaseAllResources = () => {
    Resources = {};
};

const releaseTransientResources = () => {
    for (const res of Object.values(Resources)) {
        if (res.type === ResourceStrategyType.TRANSIENT) {
            releaseResource(res.id);
        }
    }
};

const releaseResource = (id: number) => {
    const res = Resources[id];
    if (res) {
        delete res.hqr;
        res.loaded = false;
        res.length = 0;
    }
};

const preloadResources = async () => {
    const preload = [];
    for (const res of Object.values(Resources)) {
        if (res.type === ResourceStrategyType.STATIC) {
            preload.push(preloadResource(res.path, res.name));
        }
    }
    await Promise.all(preload);
    for (const res of Object.values(Resources)) {
        if (!res.loaded && res.isHQR && res.type === ResourceStrategyType.STATIC) {
            res.load();
        }
    }
};

const getResource = async (id: number) => {
    const resource = Resources[id];
    if (resource && !resource.loaded) {
        await resource.load();
    }
    return resource;
};

const getResourcePath = (id: number) => {
    return Resources[id].path;
};

export {
    ResourceType,
    ResourceName,
    registerStaticResource,
    registerTransientResource,
    releaseAllResources,
    releaseTransientResources,
    releaseResource,
    preloadResources,
    getResource,
    getResourcePath,
};
