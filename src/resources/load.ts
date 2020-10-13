
import HQR, { loadHqr } from '../hqr';
import WebApi from '../webapi';

const ResourceStrategy = {
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

const ResourceName = {
    NONE: 'NONE',
    ANIM: 'ANIM',
    BODY: 'BODY',
    RESS: 'RESS',
    SAMPLES: 'SAMPLES',
    SCENE: 'SCENE',
    SPRITES: 'SPRITES',
    SPRITERAW: 'SPRITERAW',
    TEXT: 'TEXT',
    OBJECTS: 'OBJECTS',
    LAYOUTS: 'LAYOUTS',
    BRICKS: 'BRICKS',
    GRIDS: 'GRIDS',
    MUSIC: 'MUSIC',
    ENTITIES: 'ENTITIES',
    PALETTE: 'PALETTE',
};

interface Resource {
    id: number;
    ref: Resource;
    strategy: number;
    description: string;
    path: string;
    length: number;
    index: number;
    loaded: boolean;
    isHQR: boolean;
    hqr: HQR;
    buffer: ArrayBuffer;
    getBuffer: Function;
    getBufferUint8: Function;
    getEntry: Function;
    getEntryAsync: Function;
    hasHiddenEntries: Function;
    getNextHiddenEntry: Function;
    load: Function;
    entries: [];
}

const Resources = {};

const requestResource = async (
    url,
    description = null,
    mandatory = true,
) => {
    const send = (eventName, progress?) => {
        if (description) {
            document.dispatchEvent(new CustomEvent(eventName, {
                detail: { name: description, progress }
            }));
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
                resolve(request.response);
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
const register = (
    strategy: number,
    id: string,
    description: string,
    path: string,
    entryIndex: number,
) => {
    if (Resources[id]) {
        return;
    }

    const resource = {
        id,
        strategy,
        description,
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
        getNextHiddenEntry: null,
        ref: null,
        buffer: null,
        entries: [],
    };

    // check if we have already a resource with same file
    // reuse the file to have a single file loaded in memory
    // but keep reference to this resource
    for (const res of Object.values<Resource>(Resources)) {
        if (res.path === path) {
            resource.ref = res;
            break;
        }
    }

    resource.getBuffer = () => {
        if (resource.buffer || !resource.isHQR) {
            return resource.buffer;
        }
        if (resource.index >= 0) {
            let buffer = null;
            if (resource.ref) {
                buffer = resource.ref.getEntry(resource.index);
                resource.ref.buffer = buffer;
                return buffer;
            }
            buffer = resource.hqr.getEntry(resource.index);
            resource.buffer = buffer;
            return buffer;
        }
        if (resource.ref) {
            return resource.ref.getBuffer();
        }
        return resource.hqr.getBuffer();
    };

    resource.getBufferUint8 = () => {
        return new Uint8Array(resource.getBuffer());
    };

    resource.getEntry = (index: number) => {
        if (resource.entries[index]) {
            return resource.entries[index];
        }
        let entry = null;
        if (resource.ref) {
            entry = resource.ref.getEntry(index);
            resource.entries[index] = entry;
            return entry;
        }
        entry = resource.hqr.getEntry(index);
        resource.entries[index] = entry;
        return entry;
    };

    resource.hasHiddenEntries = (index: number) => {
        return resource.hqr.hasHiddenEntries(index);
    };

    resource.getNextHiddenEntry = (index: number) => {
        return resource.hqr.getNextHiddenEntry(index);
    };

    resource.getEntryAsync = async (index: number) => {
        if (resource.ref) {
            return resource.ref.getEntryAsync(index);
        }
        return await resource.hqr.getEntryAsync(index);
    };

    resource.load = async () => {
        if (resource.loaded) {
            return;
        }
        if (!resource.isHQR) {
            resource.buffer = await requestResource(resource.path);
            resource.loaded = true;
            return;
        }
        if (resource.ref) {
            // if for some reason the referenced resource is not loaded
            // for the load of that resource. It can happen for transient resources
            // or non-preloaded static resources
            if (!resource.ref.loaded) {
                resource.ref.hqr = await loadHqr(resource.ref.path);
            }
            resource.length = resource.ref.length;
            resource.loaded = resource.ref.loaded;
            return;
        }
        resource.hqr = await loadHqr(resource.path);
        resource.length = resource.hqr.length;
        resource.loaded = true;
    };

    Resources[id] = resource;
};

// const releaseAllResources = () => {
//     Resources = {};
// };

// const releaseTransientResources = () => {
//     for (const res of Object.values(Resources)) {
//         if (res.strategy === ResourceStrategy.TRANSIENT) {
//             releaseResource(res.id);
//         }
//     }
// };

// const releaseResource = (id: string) => {
//     const res = Resources[id];
//     if (res) {
//         delete res.hqr;
//         res.loaded = false;
//         res.length = 0;
//     }
// };

let preloaded = false;

const preloadResources = async () => {
    if (preloaded) {
        return;
    }
    const preload = [];
    const resPreload = [];
    for (const res of Object.values<Resource>(Resources)) {
        if (!res.loaded && res.strategy === ResourceStrategy.STATIC) {
            preload.push(requestResource(res.path, res.description));
        }
    }
    await Promise.all(preload);
    for (const res of Object.values<Resource>(Resources)) {
        if (!res.loaded && res.strategy === ResourceStrategy.STATIC) {
            resPreload.push(res.load());
        }
    }
    await Promise.all(resPreload);
    preloaded = true;
};

const loadResource = async (id: string) => {
    const resource = Resources[id];
    if (resource && !resource.loaded) {
        await resource.load();
    }
    return resource;
};

// const getResource = (id: string) => {
//     return Resources[id];
// };

const getResourcePath = (id: string) => {
    return Resources[id].path;
};

let registered = false;

const registerResources = async (game, language, languageVoice) => {
    if (registered) {
        return;
    }
    const api = new WebApi();
    const response = await api.request(`resources/${game}.json`, 'GET', 'json');
    if (response && response.body) {
        const res = response.body;
        // @ts-ignore
        for (let e = 0; e < res.entries.length; e += 1) {
            // @ts-ignore
            const r = res.entries[e];
            let path = r.path.replace('%LANGCODE%', language);
            path = path.replace('%LANGVOICECODE%', languageVoice);
            register(ResourceStrategy[r.strategy], r.id, r.description, path, r.index);
        }
    }
    registered = true;
};

const areResourcesPreloaded = () => preloaded;

export {
    ResourceName,
    areResourcesPreloaded,
    preloadResources,
    loadResource,
    getResourcePath,
    registerResources,
};
