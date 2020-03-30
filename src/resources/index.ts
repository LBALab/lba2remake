
import HQR, { loadHqr } from '../hqr';

const ResourceType = {
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

interface Resource {
    type: number;
    name: string;
    path: string;
    loaded: boolean;
    length: number;
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
    name: string,
    path: string,
    entryIndex: number,
) => {
    if (Resources[name]) {
        return;
    }

    const resource = {
        type,
        name,
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

    Resources[name] = resource;
};

export const registerStaticResource = (
    name: string,
    path: string,
    index: number = null,
) => {
    registerResource(ResourceType.STATIC, name, path, index);
};

export const registerTransientResource = (
    name: string,
    path: string,
    index: number = null,
) => {
    registerResource(ResourceType.TRANSIENT, name, path, index);
};

export const releaseAllResources = () => {
    Resources = {};
};

export const releaseTransientResources = () => {
    for (const res of Object.values(Resources)) {
        if (res.type === ResourceType.TRANSIENT) {
            delete Resources[res.name];
        }
    }
};

export const releaseResource = (name: string) => {
    if (Resources[name]) {
        delete Resources[name];
    }
};

export const preloadResources = async () => {
    const preload = [];
    for (const res of Object.values(Resources)) {
        if (res.type === ResourceType.STATIC) {
            preload.push(preloadResource(res.path, res.name));
        }
    }
    await Promise.all(preload);
    for (const res of Object.values(Resources)) {
        if (!res.loaded && res.isHQR && res.type === ResourceType.STATIC) {
            res.load();
        }
    }
};

export const getResource = async (name: string) => {
    const resource = Resources[name];
    if (resource && !resource.loaded) {
        await resource.load();
    }
    return resource;
};
