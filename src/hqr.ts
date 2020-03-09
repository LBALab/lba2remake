import { readHqrEntry, Entry, readHqrHeader } from './utils/hqr_reader';
import WebApi from './webapi';

export enum HqrFormat {
    HQR = 0,
    OpenHQR = 1
}

export default class HQR {
    private url: string;
    private entries: Entry[] = [];
    private buffer: ArrayBuffer = null;
    private format: HqrFormat;
    private loadPromise: Promise<HQR> = null;

    constructor(url: string) {
        this.url = url;
    }

    async load(ignoreUnavailable = false, formats = [HqrFormat.HQR]) {
        if (this.buffer) {
            return this;
        }
        const api = new WebApi();
        const that = this;
        const isVoxHQR = that.url.toLowerCase().includes('vox');
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = new Promise(async (resolve, reject) => {
            for (let i = 0; i < formats.length; i += 1) {
                const format = formats[i];
                const requestUrl = that.getUrlForFormat(that.url, formats[i]);
                const result = await api.request(requestUrl, 'GET', 'arraybuffer');
                if (result.error) {
                    reject(result.error);
                    return;
                }

                if (result.status === 404) {
                    if (i < formats.length - 1) {
                        continue;
                    } else if (ignoreUnavailable) {
                        resolve();
                        return;
                    }
                } else if (result.status === 200) {
                    that.buffer = result.body;
                    that.format = format;
                    that.readHeader(isVoxHQR);
                    that.loadPromise = null;
                    resolve(that);
                    return;
                } else {
                    reject(`HQR file download failed: status=${result.status}`);
                    return;
                }
            }

        });
        return this.loadPromise;
    }

    get length(): number {
        return this.entries.length;
    }

    getEntry(index: number) {
        const entry = this.entries[index];
        return readHqrEntry(this.buffer, entry);
    }

    readHeader(isVoxHQR: boolean) {
        if (this.format === HqrFormat.HQR) {
            this.entries = readHqrHeader(this.buffer, isVoxHQR);
        }
        // TODO - load OpenHqr
    }

    hasHiddenEntries(index: number) {
        return this.entries[index].hasHiddenEntry;
    }

    getNextHiddenEntry(index: number) {
        return this.entries[index].nextHiddenEntry;
    }

    private getUrlForFormat(baseUrl: string, format: HqrFormat) {
        return (format === HqrFormat.HQR) ? baseUrl : `${baseUrl}.zip`;
    }
}

const hqrCache = {};

// Loads HQR from file. Supports native HQR and OpenHQR (zip)
// ignoreUnavailable - when true, will not fail the game if 404
// formats - will try to load different formats in the order of preference
//   e.g. [HqrFormat.HQR, HqrFormat.OpenHQR] - will try to load HQR file first,
//   and if not found (404), then OpenHQR file next
export async function loadHqr(file: string, ignoreUnavailable = false, formats = [HqrFormat.HQR]) {
    if (file in hqrCache) {
        return await hqrCache[file].load();
    }

    const hqr = new HQR(`data/${file}`);
    hqrCache[file] = hqr;
    return await hqr.load(ignoreUnavailable, formats);
}
