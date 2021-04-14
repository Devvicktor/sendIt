const webSocket = new WebSocket('ws://localhost:5000');
webSocket.onmessage = (e) => {
  handleSignallingData(JSON.parse(e.data))
}
const handleSignallingData = (data) => {
  switch (data.type) {
    case "answer":
      peerConnection.setRemoteDescription(data.answer)
      break
    case "candidate":
      peerConnection.addIceCandidate(data.candidate)
  }
}
let username;

function sendUsername() {
  username = document.getElementById('username-input').value;
  sendData({
    type: "store_user"
  });
}

function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
}
let localStream;
let peerConnection;

function startCall() {
  document.getElementById('video-call-div').style.display = 'inline';
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);
if(navigator.getUserMedia){
  navigator.getUserMedia({
      video: {
        frameRate: 24,
        width: {
          min: 480,
          max: 1280,
          ideal: 720
        },
        aspectRatio: 1.333
      },
      audio: true,
    },
    (stream) => {
      localStream = stream;
      document.getElementById('local_video').srcObject = localStream;
      let configuration = {
        "iceServers": [{
          "url":'stun:stun2.l.google.com:19302'
        }]


      };
      peerConnection = new RTCPeerConnection(configuration);
      peerConnection.addStream(localStream);
      peerConnection.onaddstream = e => {
        document.getElementById('remote_video').srcObject = e.stream;
      };
      peerConnection.onicecandidate = ((e) => {
        if (e.candidate == null)
          return
        sendData({
          type: "store_candidate",
          candidate: e.candidate
        })
      })
      createAndSendOffer();
    },
    error => {
      console.log(error);
    }
  );
}else {
  console.log("getUserMedia not supported");
}
}

function createAndSendOffer() {
  peerConnection.createOffer((offer) => {
    sendData({
      type: "store_offer",
      offer: offer
    }, (err) => {
      console.log(err)
    })
  })
}

let isAudio = true

function muteAudio() {
  isAudio = !isAudio
  localStream.getAudioTracks()[0].enabled = isAudio
}
let isVideo = true

function muteVideo() {
  isvideo = !isVideo
  localStream.getVideoTrack()[0] = isVideo
}