
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
    VOICESG: 19,
    VOICES0: 20,
    VOICES1: 21,
    VOICES2: 22,
    VOICES3: 23,
    VOICES4: 24,
    VOICES5: 25,
    VOICES6: 26,
    VOICES7: 27,
    VOICES8: 28,
    VOICES9: 29,
    VOICES10: 30,
    VOICES11: 31,
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
};

const ResourceName = {
    NONE: 'None',
    ANIM: 'Animations',
    BODY: '3d Models',
    RESS: 'Global Resources',
    SAMPLES: 'Samples',
    SCENE: 'Scenes',
    SPRITES: 'Sprites',
    SPRITERAW: 'Raw Sprites',
    TEXT: 'Text Dialogues',
    OBJECTS: 'Inventory Objects',
    LAYOUTS: 'Isometric Layouts',
    BRICKS: 'Isometric Bricks',
    GRIDS: 'Isometric Grids',
    MUSIC: 'Music',
    LOGO: 'LBA Logo',
    THEME_ADELINE: 'Adeline Theme Song',
    THEME_MAIN: 'LBA Theme Short Version',
    THEME_MENU: 'LBA Theme',
    MUSIC_TRACK_1: 'Citadel Music Scene',
    VOICESG: 'Main Game Voices',
    VOICES0: 'Voices 0',
    VOICES1: 'Voices 1',
    VOICES2: 'Voices 2',
    VOICES3: 'Voices 3',
    VOICES4: 'Voices 4',
    VOICES5: 'Voices 5',
    VOICES6: 'Voices 6',
    VOICES7: 'Voices 7',
    VOICES8: 'Voices 8',
    VOICES9: 'Voices 9',
    VOICES10: 'Voices 10',
    VOICES11: 'Voices 11',
    ASCENCE_ILE: 'Undergas Elevator',
    ASCENCE_OBL: 'Undergas Elevator Objects',
    CELEBRA2_ILE: 'Celebration Island Statue Emerged',
    CELEBRA2_OBL: 'Celebration Island Statue Emerged Objects',
    CELEBRAT_ILE: 'Celebration Island',
    CELEBRAT_OBL: 'Celebration Island Objects',
    CITABAU_ILE: 'Citadel Island',
    CITABAU_OBL: 'Citadel Island Objects',
    CITADEL_ILE: 'Citadel Island Storm',
    CITADEL_OBL: 'Citadel Island Storm Objects',
    DESERT_ILE: 'Desert Island',
    DESERT_OBL: 'Desert Island Objects',
    EMERAUDE_ILE: 'Emerald Moon',
    EMERAUDE_OBL: 'Emerald Moon Objects',
    ILOTCX_ILE: 'Island CX',
    ILOTCX_OBL: 'Island CX Objects',
    KNARTAS_ILE: 'Francos Island',
    KNARTAS_OBL: 'Francos Island Objects',
    MOON_ILE: 'Emerald Moon 2',
    MOON_OBL: 'Emerald Moon 2 Objects',
    MOSQUIBE_ILE: 'Mosquibees Island',
    MOSQUIBE_OBL: 'Mosquibees Island Objects',
    OTRINGAL_ILE: 'Otringal',
    OTRINGAL_OBL: 'Otringal Objects',
    PLATFORM_ILE: 'Wannies Island',
    PLATFORM_OBL: 'Wannies Island Objects',
    SOUSCELB_ILE: 'Volcano Island',
    SOUSCELB_OBL: 'Volcano Island Objects',
    ENTITIES: '3D Animation & Model Entites',
    PALETTE: 'Main Palette',
    MENU_BACKGROUND: 'Menu Background Image',
};

interface Resource {
    type: number;
    name: string;
    refName: string;
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
        refName: null,
    };

    // check if we have already a resource with same file
    // reuse the file to have a single file loaded in memory
    // but keep reference to this resource
    for (const res of Object.values(Resources)) {
        if (res.path === path) {
            resource.refName = res.name;
            break;
        }
    }

    resource.getBuffer = () => {
        if (resource.refName) {
            if (resource.index >= 0) {
                return Resources[resource.refName].getEntry(resource.index);
            }
            return Resources[resource.refName].getBuffer();
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
        if (resource.refName) {
            return Resources[resource.refName].getEntry(index);
        }
        return resource.hqr.getEntry(index);
    };

    resource.hasHiddenEntries = (index: number) => {
        return resource.hqr.hasHiddenEntries(index);
    };

    resource.getEntryAsync = async (index: number) => {
        if (resource.refName) {
            return Resources[resource.refName].getEntryAsync(index);
        }
        return await resource.hqr.getEntryAsync(index);
    };

    resource.load = async () => {
        if (resource.refName) {
            resource.length = Resources[resource.refName].length;
            resource.loaded = Resources[resource.refName].loaded;
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
            releaseResource(res.name);
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
};
