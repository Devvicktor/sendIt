const web_socket = new WebSocket("wss://sendithere.herokuapp.com/");

web_socket.onmessage = (e) => {
  function handleSignallingData(data) {
    switch (data.type) {
      case "offer":
        peerConnection.setRemoteDescription(data.offer);
        createAndSendAnswer();
        break;
      case "candidate":
        peerConnection.addIceCandidate(data.candidate);
    }
  }
  handleSignallingData(JSON.parse(e.data));
};

function sendData(data) {
  data.username = username;
  web_socket.send(JSON.stringify(data));
}

function joinCall() {
  let localStream;
  let username;
  let peerConnection;
  username = document.getElementById("join-input").value;
  document.getElementById("video-call-div").style.display = "inline";
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {
        video: {
          frameRate: 24,
          width: {
            min: 480,
            max: 1280,
            ideal: 720,
          },
          aspectRatio: 1.333,
        },
        audio: true,
      },
      (stream) => {
        localStream = stream;
        document.getElementById("local_video").srcObject = localStream;
        let configuration = {
          iceServers: [
            {
              url: "stun:stun2.l.google.com:19302",
            },
          ],
        };
        peerConnection = new RTCPeerConnection(configuration);
        peerConnection.addStream(localStream);
        peerConnection.onaddstream = (e) => {
          document.getElementById("remote_video").srcObject = e.stream;
        };
        peerConnection.onicecandidate = (e) => {
          if (e.candidate == null) return;
          sendData({
            type: "send_candidate",
            candidate: e.candidate,
          });
        };
        sendData({
          type: "join_call",
        });
      },
      (error) => {
        console.log(error);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}

function muteAudio() {
  let isAudio = true;
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enabled = isAudio;
}

function muteVideo() {
  let isVideo = true;
  isvideo = !isVideo;
  localStream.getVideoTrack()[0] = isVideo;
}
