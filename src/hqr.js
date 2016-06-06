export default class HQR {
    load(url, callback) {
        var that = this;
        var request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', url, true);

        request.onload = function(event) {
            if (this.status === 200) {
                that._buffer = request.response;
                that._readHeader();
                callback();
            }
        };

        request.send(null);
        this._entries = [];
    }

    get length() {
        return this._entries.length;
    }

    getEntry(index) {
        const entry = this._entries[index];
        
    }

    _readHeader() {
        const idx_array = new Uint32Array(this._buffer, 0, 256);
        for (let i = 0; i < 256; ++i) {
            if (idx_array[i] >= this._buffer.byteLength)
                break;
            const header = new DataView(this._buffer, idx_array[i], 10);
            this._entries.push({
                offset: idx_array[i],
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true)
            });
        }
    }
}


