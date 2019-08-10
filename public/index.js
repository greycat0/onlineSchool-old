let connection = new RTCPeerConnection({    //экземпляр RTCPeerConnection
  sdpSemantics: 'unified-plan',
  iceServers: [     // Information about ICE servers
    {
      urls: "stun:stun.stunprotocol.org"
    }
  ]
});


const Ws = adonis.Ws(`wss://${location.host}`).connect();    //Соединяемся к серверу по WebSocket (реализация adonis)
let socket = Ws.subscribe("rooms:" + location.pathname.split('/')[2]);         // Подписываемся на канал "connections"
// Ws.on("open", () => {
// });
socket.on('candidate', async (candidate) => {       //событие приема ice кандидата от сервера
  //console.log(1,candidate)
  if (candidate) {
    await connection.addIceCandidate(candidate)
  }
})
socket.on('sdp', async (answer) => {                //событие приема sdp ответа от сервера
  await connection.setRemoteDescription(answer)
})

socket.on('maintainer left', () => {
  console.log(`maintainer left`);
  remoteVideo.srcObject = null
})

// socket.on('close', () => {
//   console.log(`disconnected`);
//   remoteVideo.srcObject = null
// })


let remoteVideo
let localStream


async function f() {      //установить на странице объекты <video>, привязав к ним потоки

  console.log('f begin')
  // localVideo = document.createElement('video');
  // localVideo.autoplay = true;
  // localVideo.muted = true;

  remoteVideo = document.createElement('video');
  remoteVideo.autoplay = true;

  const videos = document.createElement('div');
  videos.className = 'grid';
  //videos.appendChild(localVideo);
  videos.appendChild(remoteVideo);
  window.onload = function () {
    document.body.appendChild(videos);
  }

  localStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
  localStream.getTracks().forEach(track => connection.addTrack(track, localStream));
  //localVideo.srcObject = localStream;
  const remoteStream = new MediaStream(connection.getReceivers().map(receiver => receiver.track));
  remoteVideo.srcObject = remoteStream;
  console.log('f end')
}

// // ---------------------Тест канала данных - нужно для проверки соедининия---------
// let dc = connection.createDataChannel("channel");
//
// dc.onmessage = function (event) {
//   console.log("received: " + event.data);
// };
//
//
// connection.ondatachannel = function (e) {
//   dc = e.channel
//   dc.send('to Server')
// }
// // ---------------------Тест канала данных - нужно для проверки соедининия---------


async function connect() {
  console.log('connect begin')
  let offer = await connection.createOffer({      //создаем offer
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  })
  await connection.setLocalDescription(offer)
  socket.emit('sdp', offer)       //отправляем серверу


  connection.onicecandidate = async function ({candidate}) {      //событие появления ice кандидата
    socket.emit('candidate', candidate)
  }
  connection.ontrack = function (e) {
    console.log('track!')
  }

  connection.onconnectionstatechange = () => {
    console.log('state ', connection.connectionState)
    if (connection.connectionState === 'disconnected' ||
      connection.connectionState === 'failed') {
      console.log(`disconnected`);
      remoteVideo.srcObject = null
    }
  }

  console.log('connect end')
}


async function start() {
  await f()
  await connect()
}

start()

