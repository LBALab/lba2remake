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
    _entries: Entry[] = [];
    _buffer: ArrayBuffer;
    _loaded = false;
    _loadCallbacks: Function[] = [];

    load(url: string, callback: Function) {
        const that = this;
        const request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', url, true);
        const isVoxHQR = url.toLowerCase().includes('vox');

        request.onload = function(event) {
            if (this.status === 200) {
                that._buffer = request.response;
                that._readHeader(isVoxHQR);
                that._loaded = true;
                callback.call(that);
                each(that._loadCallbacks, cb => {
                    cb.call(that);
                });
                that._loadCallbacks = [];
            }
        };

        request.send(null);
    }

    callWhenLoaded(callback: Function) {
        if (this._loaded) {
            callback.call(this);
        } else {
            this._loadCallbacks.push(callback);
        }
    }

    get length(): number {
        return this._entries.length;
    }

    getEntry(index: number) {
        const entry = this._entries[index];
        if (entry.type) {
            const tgt_buffer = new ArrayBuffer(entry.originalSize);
            const source = new Uint8Array(this._buffer, entry.offset, entry.compressedSize);
            const target = new Uint8Array(tgt_buffer);
            let src_pos = 0;
            let tgt_pos = 0;
            while ((src_pos + 1) <= entry.compressedSize) {
                const flag = source[src_pos];

                for (let i = 0; i < 8; ++i) {
                    src_pos++;

                    if ((flag & (1 << i)) !== 0) {
                        target[tgt_pos] = source[src_pos];
                        tgt_pos++;
                    } else {
                        let e = source[src_pos] * 256 + source[src_pos + 1];
                        let len = ((e >> 8) & 0x000F) + entry.type + 1;
                        let addr = ((e << 4) & 0x0FF0) + ((e >> 12) & 0x00FF);

                        for (let g = 0; g < len; ++g) {
                            target[tgt_pos] = target[tgt_pos - addr - 1];
                            tgt_pos++;
                        }
                        src_pos++;
                    }

                    if ((src_pos + 1) >= entry.compressedSize)
                        break;
                }

                src_pos++;
            }
            return tgt_buffer;
        } else {
            if (entry.hasHiddenEntry) {
                const tgt_buffer = new ArrayBuffer(entry.originalSize);
                const source = new Uint8Array(this._buffer, entry.offset, entry.compressedSize);
                const target = new Uint8Array(tgt_buffer);
                source[0] = 0; // entries that have hidden entries are marked with 1 at the start, making the file to be faulty
                target.set(source);
                return tgt_buffer;
            }
            return this._buffer.slice(entry.offset, entry.offset + entry.compressedSize);
        }
    }

    _readHeader(isVoxHQR: boolean) {
        const firstOffset = new Int32Array(this._buffer, 0, 1);
        const numEntries = (firstOffset[0] / 4) - 1;
        const idx_array = new Uint32Array(this._buffer, 0, numEntries);
        for (let i = 0; i < idx_array.length; ++i) {
            const header = new DataView(this._buffer, idx_array[i], 10);
            this._entries.push({
                offset: idx_array[i] + 10,
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true),
                hasHiddenEntry: false
            });
        }
        // check if hidden entries exist and add them
        if (isVoxHQR) {
            for (let i = 0; i < idx_array.length; ++i) {
                const entry = this._entries[i];
                const entryEndOffset = entry.offset + entry.compressedSize + 10;
                let nextEntryOffset = this._buffer.byteLength; // end of file
                if (i + 1 < idx_array.length) {
                    nextEntryOffset = this._entries[i+1].offset;
                }
                if (entryEndOffset < nextEntryOffset) { // hidden entry found
                    entry.hasHiddenEntry = true;
                    this._entries.splice(i+1, 0, {
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
        return this._entries[index].hasHiddenEntry;
    }
}

const hqrCache = {};

export function loadHqrAsync(file: string) {
    return (callback: Function) => {
        if (file in hqrCache) {
            hqrCache[file].callWhenLoaded(function() {
                callback(null, this);
            });
        } else {
            const hqr = new HQR();
            hqrCache[file] = hqr;
            hqr.load(`data/${file}`, function() {
                callback(null, this);
            });
        }
    }
}
