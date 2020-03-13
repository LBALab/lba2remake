import { readHqrEntry, Entry, readHqrHeader } from './utils/hqr/hqr_reader';
import WebApi from './webapi';
import { readOpenHqrHeader, readOpenHqrEntry, OpenEntry, readZip }
    from './utils/hqr/open_hqr_reader';

export enum HqrFormat {
    HQR = 0,
    OpenHQR = 1
}

export default class HQR {
    private url: string;
    private entries: Entry[] = [];
    private openEntries: OpenEntry[] = [];
    private buffer: ArrayBuffer = null;
    private zip: any = null;
    private format: HqrFormat;
    private loadPromise: Promise<HQR> = null;

    constructor(url: string) {
        this.url = url;
    }

    async load(ignoreUnavailable = false, format: HqrFormat) {
        if (this.buffer || this.zip) {
            return this;
        }
        const api = new WebApi();
        const that = this;
        const isVoxHQR = that.url.toLowerCase().includes('vox');
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = new Promise(async (resolve, reject) => {
            const requestUrl = that.getUrlForFormat(that.url, format);
            const result = await api.request(requestUrl, 'GET', 'arraybuffer');
            if (result.error) {
                reject(result.error);
                return;
            }

            if (result.status === 404 && ignoreUnavailable) {
                resolve();
                return;
            }

            if (result.status === 200) {
                that.buffer = result.body;
                that.format = format;
                await that.readHeader(isVoxHQR);
                that.loadPromise = null;
                resolve(that);
                return;
            }

            reject(`HQR file download failed: status=${result.status}`);
            return;
        });
        return this.loadPromise;
    }

    get length(): number {
        return this.entries.length;
    }

    getEntry(index: number) {
        const entry = this.entries[index];
        if (this.format === HqrFormat.HQR) {
            return readHqrEntry(this.buffer, entry);
        }
        throw 'sync getEntry function works only with HQR format. Use getEntryAsync for OpenHqr.';
    }

    async getEntryAsync(index: number) {
        if (this.format === HqrFormat.HQR) {
            return this.getEntry(index);
        }
        if (this.format === HqrFormat.OpenHQR) {
            return await readOpenHqrEntry(this.zip, this.openEntries[index]);
        }
        throw `Unsupported format ${this.format}`;
    }

    async readHeader(isVoxHQR: boolean) {
        if (this.format === HqrFormat.HQR) {
            this.entries = readHqrHeader(this.buffer, isVoxHQR);
        } else if (this.format === HqrFormat.OpenHQR) {
            this.zip = await readZip(this.buffer);
            this.buffer = null;
            const result = await this.readOpenHqrToEntries(this.zip);
            this.openEntries = result[0] as OpenEntry[];
            this.entries = result[1] as Entry[];
        } else {
            throw `Unsupported format ${this.format}`;
        }
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

    private async readOpenHqrToEntries(buffer: ArrayBuffer) {
        const openEntries = await readOpenHqrHeader(buffer);
        return [openEntries, openEntries.map((openEntry) => {
            return {
                index: openEntry.index,
                isBlank: openEntry.file === '',
                type: openEntry.type,
                headerOffset: 0,
                offset: 0,
                originalSize: 0,
                compressedSize: 0,
                hasHiddenEntry: openEntry.hasHiddenEntry,
                nextHiddenEntry: openEntry.nextHiddenEntry
            } as Entry;
        })];
    }
}

const hqrCache = {};

// Loads HQR from file. Supports native HQR and OpenHQR (zip)
// ignoreUnavailable - when true, will not fail the game if 404
// format - will load the given hqr format (HQR, or OpenHQR)
export async function loadHqr(file: string, ignoreUnavailable = false, format = HqrFormat.HQR) {
    if (file in hqrCache) {
        return await hqrCache[file].load();
    }

    const hqr = new HQR(`data/${file}`);
    hqrCache[file] = hqr;
    return await hqr.load(ignoreUnavailable, format);
}
