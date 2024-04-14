const socket = io();
const videoGrid = document.getElementById('video-grid');
const startCallBtn = document.getElementById('startCallBtn');
const endCallBtn = document.getElementById('endCallBtn');
let myPeerConnection;

const constraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    addVideoStream(myVideo, stream);

    socket.emit('join', 'room1');

    socket.on('user-disconnected', () => {
      if (myPeerConnection) {
        myPeerConnection.close();
      }
    });

    socket.on('offer', (offer) => {
      myPeerConnection = new RTCPeerConnection();
      myPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          stream.getTracks().forEach((track) => myPeerConnection.addTrack(track, stream));
          return myPeerConnection.createAnswer();
        })
        .then((answer) => {
          myPeerConnection.setLocalDescription(answer);
          socket.emit('answer', answer, 'room1');
        })
        .catch((error) => {
          console.error('Error creating answer:', error);
        });

      myPeerConnection.ontrack = (event) => {
        const peerVideo = document.createElement('video');
        addVideoStream(peerVideo, event.streams[0]);
      };

      myPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', event.candidate, 'room1');
        }
      };
    });

    socket.on('answer', (answer) => {
      myPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', (candidate) => {
      myPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
  })
  .catch((error) => {
    console.error('Error accessing media devices:', error);
  });

function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream;
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
  });
  videoGrid.append(videoElement);
}

startCallBtn.addEventListener('click', () => {
  const myPeerConnection = new RTCPeerConnection();

  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      stream.getTracks().forEach((track) => myPeerConnection.addTrack(track, stream));
      return myPeerConnection.createOffer();
    })
    .then((offer) => {
      myPeerConnection.setLocalDescription(offer);
      socket.emit('offer', offer, 'room1');
    })
    .catch((error) => {
      console.error('Error creating offer:', error);
    });

  myPeerConnection.ontrack = (event) => {
    const peerVideo = document.createElement('video');
    addVideoStream(peerVideo, event.streams[0]);
  };

  myPeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate, 'room1');
    }
  };
});

endCallBtn.addEventListener('click', ()
  
