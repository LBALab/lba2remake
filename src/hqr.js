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
    }

    getEntry(index) {
        
    }

    _readHeader() {
        this._indices = [];
        const uia = new Uint32Array(this._buffer, 0, 256);
        for (let i = 0; i < 256; ++i) {
            if (uia[i] >= this._buffer.byteLength)
                break;
            this._indices.push(uia[i]);
        }
        this.length = this._indices.length;
    }
}


