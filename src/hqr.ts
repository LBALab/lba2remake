import { readHqrEntry, Entry, readHqrHeader } from './utils/hqr_reader';

export default class HQR {
    private url: string;
    private entries: Entry[] = [];
    private buffer: ArrayBuffer = null;
    private loadPromise: Promise<HQR> = null;

    constructor(url: string) {
        this.url = url;
    }

    async load() {
        if (this.buffer) {
            return this;
        }

        const that = this;
        if (!this.loadPromise) {
            this.loadPromise = new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.responseType = 'arraybuffer';
                request.open('GET', that.url, true);
                const isVoxHQR = that.url.toLowerCase().includes('vox');

                request.onload = function onload() {
                    if (this.status === 200) {
                        that.buffer = request.response;
                        that.readHeader(isVoxHQR);
                        that.loadPromise = null;
                        resolve(that);
                    } else {
                        reject(`HQR file download failed: status=${this.status}`);
                    }
                };

                request.onerror = function onerror(err) {
                    reject(err);
                };

                request.send(null);
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

export async function loadHqr(file: string) {
    if (file in hqrCache) {
        return await hqrCache[file].load();
    }

    const hqr = new HQR(`data/${file}`);
    hqrCache[file] = hqr;
    return await hqr.load();
}
