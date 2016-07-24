let ws = null;
let handler = () => {};

export default class SyncServer {
    static init(url) {
        initWS(url);
        initWebRTC();
    }

    static send(content) {
        if (ws && ws.readyState == WebSocket.OPEN) {
            ws.send(content);
        }
    }

    static onMsg(h) {
        handler = h;
    }
}

function initWS(url) {
    ws = new WebSocket(`ws://${url}`);
    ws.binaryType = "arraybuffer";
    ws.onclose = function() {
        initWS(url);
    };
    ws.onmessage = function(msg) {
        if (msg.data instanceof ArrayBuffer) {
            const data = new DataView(msg.data);
            const type = data.getUint8(0);
            handler(type, new DataView(msg.data, 1));
        } else {
            const data = JSON.parse(msg.data);
            switch (data.type) {
                case 'offer':
                    break;
            }
        }
    };
}

function initWebRTC() {
    const peerConnection = new window.RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }]
    });

    peerConnection.onicecandidate = function(e){
        if (!e || !e.candidate)
            return;
        console.log(e.candidate.candidate);
        //sendNegotiation("candidate", event.candidate);
    };

    const dataChannel = peerConnection.createDataChannel("datachannel", {reliable: false});
    dataChannel.onmessage = function(e){console.log("DC message:" +e.data);};
    dataChannel.onopen = function(){console.log("------ DATACHANNEL OPENED ------");};
    dataChannel.onclose = function(){console.log("------- DC closed! -------")};
    dataChannel.onerror = function(){console.log("DC ERROR!!!")};

    peerConnection.createOffer({
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }).then(function(offer) {
        peerConnection.setLocalDescription(offer);
        console.log("Sending offer");
        SyncServer.send(JSON.stringify({type: 'offer', sdp: offer.sdp}));
    }, function(err) {
        console.log("Error creating offer: ", err);
    });
}

window.onerror = function(e){
    alert(e);
};

SyncServer.DEVICE_ORIENTATION = 0;
SyncServer.LOCATION = 1;
