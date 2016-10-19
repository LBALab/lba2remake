// @flow

type Entry = {
    type: number,
    offset: number,
    originalSize: number,
    compressedSize: number
};

export default class HQR {
    _entries: Entry[] = [];
    _buffer: ArrayBuffer;

    load(url: string, callback: Function) {
        var that = this;
        var request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', url, true);

        request.onload = function(event) {
            if (this.status === 200) {
                that._buffer = request.response;
                that._readHeader();
                callback.call(that);
            }
        };

        request.send(null);
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

                    if ((flag & (1 << i)) != 0) {
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
            return this._buffer.slice(entry.offset, entry.offset + entry.compressedSize);
        }
    }

    _readHeader() {
        const firstOffset = new Int32Array(this._buffer, 0, 1);
        const numEntries = (firstOffset[0] / 4) - 1;
        const idx_array = new Uint32Array(this._buffer, 0, numEntries);
        for (let i = 0; i < idx_array.length; ++i) {
            const header = new DataView(this._buffer, idx_array[i], 10);
            this._entries.push({
                offset: idx_array[i] + 10,
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true)
            });
        }
    }
}

const hqrCache = {};

export function loadHqrAsync(file: string) {
    return (callback: Function) => {
        if (file in hqrCache) {
            callback(null, hqrCache[file]);
        } else {
            new HQR().load(`data/${file}`, function() {
                hqrCache[file] = this;
                callback.call(null, null, this);
            });
        }
    }
}
