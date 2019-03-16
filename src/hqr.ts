import {each} from 'lodash';

interface Entry {
    type: number;
    offset: number;
    originalSize: number;
    compressedSize: number;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

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
        if (entry.type) {
            const tgt_buffer = new ArrayBuffer(entry.originalSize);
            const source = new Uint8Array(this.buffer, entry.offset, entry.compressedSize);
            const target = new Uint8Array(tgt_buffer);
            let src_pos = 0;
            let tgt_pos = 0;
            while ((src_pos + 1) <= entry.compressedSize) {
                const flag = source[src_pos];

                for (let i = 0; i < 8; i += 1) {
                    src_pos += 1;

                    if ((flag & (1 << i)) !== 0) {
                        target[tgt_pos] = source[src_pos];
                        tgt_pos += 1;
                    } else {
                        const e = (source[src_pos] * 256) + source[src_pos + 1];
                        const len = ((e >> 8) & 0x000F) + entry.type + 1;
                        const addr = ((e << 4) & 0x0FF0) + ((e >> 12) & 0x00FF);

                        for (let g = 0; g < len; g += 1) {
                            target[tgt_pos] = target[tgt_pos - addr - 1];
                            tgt_pos += 1;
                        }
                        src_pos += 1;
                    }

                    if ((src_pos + 1) >= entry.compressedSize)
                        break;
                }

                src_pos += 1;
            }
            return tgt_buffer;
        }
        if (entry.hasHiddenEntry) {
            const tgt_buffer = new ArrayBuffer(entry.originalSize);
            const source = new Uint8Array(this.buffer, entry.offset, entry.compressedSize);
            const target = new Uint8Array(tgt_buffer);
            // entries that have hidden entries are marked with 1 at the start,
            // making the file to be faulty
            source[0] = 0;
            target.set(source);
            return tgt_buffer;
        }
        return this.buffer.slice(entry.offset, entry.offset + entry.compressedSize);
    }

    readHeader(isVoxHQR: boolean) {
        const firstOffset = new Int32Array(this.buffer, 0, 1);
        const numEntries = (firstOffset[0] / 4) - 1;
        const idx_array = new Uint32Array(this.buffer, 0, numEntries);
        for (let i = 0; i < idx_array.length; i += 1) {
            const header = new DataView(this.buffer, idx_array[i], 10);
            this.entries.push({
                offset: idx_array[i] + 10,
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true),
                hasHiddenEntry: false,
                nextHiddenEntry: -1
            });
        }
        // check if hidden entries exist and add them
        if (isVoxHQR) {
            for (let i = 0; i < idx_array.length; i += 1) {
                const entry = this.entries[i];
                let entryEndOffset = entry.offset + entry.compressedSize + 10;
                let nextEntryOffset = this.buffer.byteLength; // end of file
                if (i + 1 < idx_array.length) {
                    nextEntryOffset = this.entries[i + 1].offset;
                }
                if (entryEndOffset < nextEntryOffset) {
                    entry.hasHiddenEntry = true;
                    entry.nextHiddenEntry = this.entries.length;
                }
                while (entryEndOffset < nextEntryOffset) { // hidden entry found
                    const header = new DataView(this.buffer, entryEndOffset - 10, 10);
                    const e = {
                        offset: entryEndOffset,
                        originalSize: header.getUint32(0, true),
                        compressedSize: header.getUint32(4, true),
                        type: header.getInt16(8, true),
                        hasHiddenEntry: false,
                        nextHiddenEntry: -1
                    };
                    entryEndOffset = e.offset + e.compressedSize + 10;
                    if (entryEndOffset < nextEntryOffset) {
                        e.hasHiddenEntry = true;
                        e.nextHiddenEntry = this.entries.length + 1;
                    }
                    this.entries.push(e);
                }
            }
        }
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
