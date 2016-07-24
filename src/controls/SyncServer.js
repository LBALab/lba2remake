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
        if (msg.data instanceof ArrayBuffer) {
            const data = new DataView(msg.data);
            const type = data.getUint8(0);
            handler(type, new DataView(msg.data, 1));
        } else {
            const data = JSON.parse(msg.data);
            switch (data.type) {
                case 'offer':
                    makeAnswer(data);
                    break;
                case 'answer':
                    receiveAnswer(data);
                    break;
                case 'candidate':
                    receiveCandidate(data);
                    break;
            }
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
            SyncServer.sendCtrl(JSON.stringify({type: 'offer', sdp: offer.sdp}));
        }, function(err) {
            alert("Error creating offer: " + err);
        });
    }, 4000);
}

function makeAnswer(data) {
    initPeerConnection();
    peerConnection.setRemoteDescription(new window.RTCSessionDescription(data));

    peerConnection.createAnswer({
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    }).then(function(answer) {
        peerConnection.setLocalDescription(answer);
        console.log("Sending answer");
        SyncServer.sendCtrl(JSON.stringify({type: 'answer', sdp: answer.sdp}));
    }, function(err) {
        console.error("Error creating answer: ", err);
    });
}

function receiveAnswer(data) {
    peerConnection.setRemoteDescription(new window.RTCSessionDescription(data));
}

function initPeerConnection() {
    if (peerConnection)
        peerConnection.close();

    peerConnection = new window.RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }]
    });

    peerConnection.onicecandidate = function(e){
        if (!e || !e.candidate)
            return;
        console.log(e.candidate.candidate);
        SyncServer.sendCtrl(JSON.stringify({type: 'candidate', candidate: e.candidate.candidate}));
    };

    dataChannel = peerConnection.createDataChannel("datachannel", {reliable: false, ordered: false});
    dataChannel.binaryType = "arraybuffer";

    dataChannel.onmessage = function(e) {
        console.log("DC message:" + e.data);
    };

    dataChannel.onopen = function() {
        console.log("------ DATACHANNEL OPENED ------", dataChannel.readyState);
    };

    dataChannel.onclose = function() {
        console.log("------- DC closed! -------")
    };

    dataChannel.onerror = function() {
        console.log("DC ERROR!!!")
    };
}

function receiveCandidate(data) {
    if (!peerConnection)
        return;
    //console.log('Received candidate:', data.candidate);
    peerConnection.addIceCandidate(new window.RTCIceCandidate({candidate: data.candidate}));
}

window.onerror = function(e, x, y, z, ex){
    //alert(ex);
};

SyncServer.DEVICE_ORIENTATION = 0;
SyncServer.LOCATION = 1;
