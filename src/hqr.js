// @flow

import {each} from 'lodash';

type Entry = {
    type: number,
    offset: number,
    originalSize: number,
    compressedSize: number,
    hasHiddenEntry: boolean
};

export default class HQR {
    entries: Entry[] = [];
    buffer: ArrayBuffer;
    loaded = false;
    loadCallbacks: Function[] = [];

    load(url: string, callback: Function) {
        const that = this;
        const request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', url, true);
        const isVoxHQR = url.toLowerCase().includes('vox');

        request.onload = function onload() {
            if (this.status === 200) {
                that.buffer = request.response;
                that.readHeader(isVoxHQR);
                that.loaded = true;
                callback.call(that);
                each(that.loadCallbacks, (cb) => {
                    cb.call(that);
                });
                that.loadCallbacks = [];
            }
        };

        request.send(null);
    }

    callWhenLoaded(callback: Function) {
        if (this.loaded) {
            callback.call(this);
        } else {
            this.loadCallbacks.push(callback);
        }
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
        } else if (entry.hasHiddenEntry) {
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
                hasHiddenEntry: false
            });
        }
        // check if hidden entries exist and add them
        if (isVoxHQR) {
            for (let i = 0; i < idx_array.length; i += 1) {
                const entry = this.entries[i];
                const entryEndOffset = entry.offset + entry.compressedSize + 10;
                let nextEntryOffset = this.buffer.byteLength; // end of file
                if (i + 1 < idx_array.length) {
                    nextEntryOffset = this.entries[i + 1].offset;
                }
                if (entryEndOffset < nextEntryOffset) { // hidden entry found
                    entry.hasHiddenEntry = true;
                    this.entries.splice(i + 1, 0, {
                        offset: entryEndOffset,
                        originalSize: nextEntryOffset - entryEndOffset,
                        compressedSize: nextEntryOffset - entryEndOffset,
                        type: 0,
                        hasHiddenEntry: false
                    });
                }
            }
        }
    }

    hasHiddenEntries(index: number) {
        return this.entries[index].hasHiddenEntry;
    }
}

const hqrCache = {};

export function loadHqrAsync(file: string) {
    return (callback: Function) => {
        if (file in hqrCache) {
            const hqr = hqrCache[file];
            hqr.callWhenLoaded(() => {
                callback(null, hqr);
            });
        } else {
            const hqr = new HQR();
            hqrCache[file] = hqr;
            hqr.load(`data/${file}`, () => {
                callback(null, hqr);
            });
        }
    };
}
