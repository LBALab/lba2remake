let ws = null;
let handler = () => {};

export default class SyncServer {
    static init(url) {
        ws = new WebSocket(`ws://${url}`);
        ws.binaryType = "arraybuffer";
        ws.onclose = function() {
            SyncServer.init(url);
        };
        ws.onmessage = function(msg) {
            handler(msg.data);
        };
    }

    static send(buffer) {
        if (ws && ws.readyState == WebSocket.OPEN) {
            ws.send(buffer);
        }
    }

    static onMsg(h) {
        handler = h;
    }
}

SyncServer.DEVICE_ORIENTATION = 0;
SyncServer.LOCATION = 1;