import {isMobile} from '../utils';

let ws = null;
let peerConnection = null;
let dataChannel = null;
let handler = () => {};

export default class SyncServer {
    static init(url) {
        initWS(url);
    }

    static sendCtrl(content) {
        if (ws && ws.readyState == WebSocket.OPEN) {
            ws.send(content);
        }
    }

    static send(content) {
        if (dataChannel && dataChannel.readyState == 'open') {
            dataChannel.send(content);
        }
    }

    static onMsg(h) {
        handler = h;
    }
}

function initWS(url) {
    ws = new WebSocket(`ws://${url}`);
    ws.binaryType = "arraybuffer";
    ws.onopen = function() {
        if (isMobile() && window.RTCPeerConnection) {
            makeOffer();
        }
    };
    ws.onclose = function() {
        initWS(url);
    };
    ws.onmessage = function(msg) {
        const data = JSON.parse(msg.data);
        switch (data.type) {
            case 'offer':
                makeAnswer(data.offer);
                break;
            case 'answer':
                receiveAnswer(data.answer);
                break;
            case 'candidate':
                receiveCandidate(data.candidate);
                break;
        }
    };
}

function makeOffer() {
    initPeerConnection();

    setTimeout(function() {
        peerConnection.createOffer({
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }
        }).then(function(offer) {
            peerConnection.setLocalDescription(offer);
            console.log("Sending offer");
            SyncServer.sendCtrl(JSON.stringify({type: 'offer', offer: offer}));
        }, function(err) {
            alert("Error creating offer: " + err);
        });

        dataChannel = peerConnection.createDataChannel("datachannel", {reliable: false, ordered: false, maxPacketLifeTime: 10});
        dataChannel.binaryType = "arraybuffer";

        setupDataChannel();
    }, 4000);
}

function makeAnswer(offer) {
    initPeerConnection();
    peerConnection.setRemoteDescription(new window.RTCSessionDescription(offer));

    peerConnection.ondatachannel = function(e) {
        dataChannel = e.channel;
        setupDataChannel();
    };

    peerConnection.createAnswer({
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }).then(function(answer) {
        peerConnection.setLocalDescription(answer);
        console.log("Sending answer", answer);
        SyncServer.sendCtrl(JSON.stringify({type: 'answer', answer: answer}));
    }, function(err) {
        console.error("Error creating answer: ", err);
    });
}

function receiveAnswer(answer) {
    peerConnection.setRemoteDescription(new window.RTCSessionDescription(answer));
}

function initPeerConnection() {
    if (peerConnection)
        peerConnection.close();

    peerConnection = new window.RTCPeerConnection({
        iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
        }]
    });

    peerConnection.onicecandidate = function(e){
        if (!e || !e.candidate)
            return;
        SyncServer.sendCtrl(JSON.stringify({type: 'candidate', candidate: e.candidate}));
    };
}

function setupDataChannel() {
    let lastCount = -1;

    dataChannel.onmessage = function(msg) {
        const data = new DataView(msg.data);
        const type = data.getUint8(0);
        if (isMobile())
            alert('onmsg' + JSON.stringify(msg));
        const count = data.getUint32(1);
        if (!(count < lastCount)) {
            lastCount = count;
            handler(type, new DataView(msg.data, 5));
        } else {
            console.log('Dropped msg:', count);
        }
    };

    dataChannel.onopen = function() {
        console.log("------ DATACHANNEL OPENED ------");
    };

    dataChannel.onclose = function() {
        console.log("------- DC closed! -------")
    };

    dataChannel.onerror = function() {
        console.log("DC ERROR!!!")
    };
}

function receiveCandidate(candidate) {
    if (!peerConnection)
        return;
    //console.log('Received candidate:', data.candidate);
    peerConnection.addIceCandidate(new window.RTCIceCandidate(candidate));
}

window.onerror = function(e, x, y, z, ex){
    //alert(ex);
};

SyncServer.DEVICE_ORIENTATION = 0;
SyncServer.LOCATION = 1;
