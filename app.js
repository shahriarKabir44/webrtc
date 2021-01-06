

const roomName = 'observable-sexsex'

const drone = new ScaleDrone('yiS12Ts5RdNhebyM')

const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

var room;
var rtc;

function onSuccess() { };


drone.on('open', (error) => {
    if (error) return console.error(error);
    room = drone.subscribe(roomName)
    room.on('open', (error) => { if (error) return console.error(error); })
    room.on('members', (members) => {
        console.log('sess', members)
        startWebRTC(members.length == 2)
    })
})

function sendms(message) {
    drone.publish({
        room: roomName,
        message
    });
}

function startWebRTC(isofr) {
    pc = new RTCPeerConnection(configuration)
    pc.onicecandidate = event => {
        if (event.candidate) {
            sendms({ 'candidate': event.candidate });
        }
    }
    if (isofr) {
        pc.onnegotiationneeded = () => {
            pc.createOffer().then(createlocaldsc).catch((error) => {
                if (error) console.log(error)
            })
        }
    }
    pc.ontrack = event => {
        const stream = event.streams[0];
        if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            remoteVideo.srcObject = stream;
        }
    };
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        localVideo.srcObject = stream;
        stream.getTracks().forEach(tracc => { pc.addTrack(tracc, stream) })
    }, (error) => {
        if (error) console.log(error)
    })

    room.on('data', (message, client) => {
        if (client.id == drone.clientId) return
        if (message.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                if (pc.remoteDescription.type === 'offer') {
                    pc.createAnswer().then(createlocaldsc).catch((error) => {
                        if (error) console.log(error)
                    });
                }
            }, (error) => {
                if (error) console.log(error)
            });
        } else if (message.candidate) {
            pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), onSuccess, (error) => {
                    if (error) console.log(error)
                }
            );
        }
    })
}

function createlocaldsc(desc) {
    pc.setLocalDescription(desc, () => {
        sendms({ 'sdp': pc.localDescription })
    })
}
