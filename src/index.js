
// require("babel-polyfill");
// require('@adonisjs/websocket-client')

let connection = new RTCPeerConnection({
  sdpSemantics: 'unified-plan',
  iceServers: [     // Information about ICE servers - Use your own!
    {
      urls: "stun:stun.stunprotocol.org"
    }
  ]
});
//console.log(adonis)
//const ws = adonis.Ws('ws://localhost:3333')
const socket = new WebSocket('ws://localhost:3333/news')
//const io = ws('localhost:3333/', {})
//const client = io.channel('chat').connect(console.log)
//client.joinRoom('index', {}, console.log)
socket.onopen = function (){
  console.log(1232)
  socket.send('test')
}

async function f() {
  const localVideo = document.createElement('video');
  localVideo.autoplay = true;
  localVideo.muted = true;

  const remoteVideo = document.createElement('video');
  remoteVideo.autoplay = true;

  const videos = document.createElement('div');
  videos.className = 'grid';
  videos.appendChild(localVideo);
  videos.appendChild(remoteVideo);
  document.body.appendChild(videos);


  const localStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })

  localStream.getTracks().forEach(track => connection.addTrack(track, localStream));

  localVideo.srcObject = localStream;
  console.log(connection.getReceivers())
  const remoteStream = new MediaStream(connection.getReceivers().map(receiver => receiver.track));
  remoteVideo.srcObject = remoteStream;
}





f()
connect()

let channel = connection.createDataChannel('aaa', {
  ordered: false,
  maxRetransmitTime: 1000
})
console.log(channel)
connection.onicecandidate = async function({candidate}){
  try {
    let ajax = new XMLHttpRequest();
    ajax.open('POST', 'connect', true);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send(JSON.stringify({candidate}));
    console.log('ok')
  }catch (candidate) {
    console.log('err')
  }

  console.log(123,candidate)
}

connection.ondatachannel = function(e){
  console.log(1234,e)
}
console.log(channel.readyState)

channel.onopen = function () {
  console.log(channel.readyState)
  channel.send('asdfasd')
}

async function connect() {

  let offer = await connection.createOffer({
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  })
  await connection.setLocalDescription(offer)
  console.log(offer)
  let ajax = new XMLHttpRequest();
  ajax.open('POST', 'connect', true);
  ajax.setRequestHeader('Content-Type', 'application/json');
  ajax.send(JSON.stringify({offer}));
  ajax.onreadystatechange = async function () {
    if (ajax.readyState === 4) {
      await connection.setRemoteDescription(JSON.parse(ajax.responseText))
      console.log(connection.remoteDescription)
    }
  }
}



function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
