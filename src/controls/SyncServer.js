let ws = null;
let handlers = {

};

export default class SyncServer {
    static init(url) {
        ws = new WebSocket(`ws://${url}`);
        ws.onclose = function() {
            SyncServer.init(url);
        };
        ws.onmessage = function(rawMsg) {
            const msg = JSON.parse(rawMsg.data);
            if (msg.type in handlers) {
                handlers[msg.type](msg.value);
            }
        };
    }

    static send(type, value) {
        if (ws && ws.readyState == WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: type,
                value: value
            }));
        }
    }

    static onMsg(type, handler) {
        handlers[type] = handler;
    }
}
