
import HQR, { loadHqr } from '../hqr';

const ResourceType = {
    TRANSIENT: 0,
    STATIC: 1,
};

interface Resource {
    type: number;
    name: string;
    path: string;
    loaded: boolean;
    hqr: HQR;
    getEntry: Function;
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
const registerResource = (type: number, name: string, path: string) => {
    const resource = {
        type,
        name,
        path,
        loaded: false,
        hqr: null,
        getEntry: null,
        load: null,
    };

    resource.getEntry = async (index: number) => {
        if (!resource.hqr) {
            return null;
        }
        return await resource.hqr.getEntry(index);
    };

    resource.load = async () => {
        resource.hqr = await loadHqr(resource.path);
        resource.loaded = true;
    };

    Resources[`${name}`] = resource;
};

export const registerStaticResource = (name: string, path: string) => {
    registerResource(ResourceType.STATIC, name, path);
};

export const registerTransientResource = (name: string, path: string) => {
    registerResource(ResourceType.TRANSIENT, name, path);
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
        if (res.type === ResourceType.STATIC) {
            res.load();
        }
    }
};

export const getResourceEntry = async (name: string, index: number) => {
    const resource = Resources[name];
    if (resource && resource.loaded) {
        return await resource.getEntry();
    }
    await resource.load();
    return await resource.getEntry(index);
};
