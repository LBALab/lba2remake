import { readHqrEntry, Entry, readHqrHeader } from './utils/hqr_reader';
import WebApi from './webapi';

export default class HQR {
    private url: string;
    private entries: Entry[] = [];
    private buffer: ArrayBuffer = null;
    private loadPromise: Promise<HQR> = null;

    constructor(url: string) {
        this.url = url;
    }

    async load(ignoreUnavailable = false) {
        if (this.buffer) {
            return this;
        }
        const api = new WebApi();
        const that = this;
        const isVoxHQR = that.url.toLowerCase().includes('vox');
        if (!this.loadPromise) {
            this.loadPromise = new Promise(async (resolve, reject) => {
                const result = await api.request(that.url, 'GET', 'arraybuffer');
                if (result.error) {
                    reject(result.error);
                    return;
                }

                if (ignoreUnavailable && result.status === 404) {
                    resolve();
                    return;
                }
                if (result.status === 200) {
                    that.buffer = result.body;
                    that.readHeader(isVoxHQR);
                    that.loadPromise = null;
                    resolve(that);
                    return;
                }
                reject(`HQR file download failed: status=${result.status}`);
            });
        }
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
        this.entries = readHqrHeader(this.buffer, isVoxHQR);
    }

    hasHiddenEntries(index: number) {
        return this.entries[index].hasHiddenEntry;
    }

    getNextHiddenEntry(index: number) {
        return this.entries[index].nextHiddenEntry;
    }
}

const hqrCache = {};

export async function loadHqr(file: string, ignoreUnavailable = false) {
    if (file in hqrCache) {
        return await hqrCache[file].load();
    }

    const hqr = new HQR(`data/${file}`);
    hqrCache[file] = hqr;
    return await hqr.load(ignoreUnavailable);
}
