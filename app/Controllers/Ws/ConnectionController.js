'use strict'

let rooms = []

class Room {
  constructor(name){
    this.id = rooms.reduce(function (max, room) {
      console.log('id:', room.id, max)
      if (room.id > max){
        return room.id
      }
    }, 0) + 1
    this.name = name
    this.maintainer = {}
    this.maintainer.connection = null
    this.maintainer.tracks = []
    this.viewers = []
    rooms.push(this)
    console.log(`room added: name-${this.name}, id-${this.id}`)
  }
  addMaintainer(connection){
    connection.ontrack =  (e) => {
      console.log('main track!!!')
      if (e.track.kind === 'video') {
        this.maintainer.connection.addTrack(e.track)
      }
      this.maintainer.tracks.push(e.track)
    }
    connection.onconnectionstatechange = () => {
      console.log('state ', this.name, ':', connection.connectionState)
      if( connection.connectionState === 'disconnected' ||
        connection.connectionState === 'failed') {
        console.log(`${this.name} disconnected`);
        this.deleteRoom()
      }
    }
    this.maintainer.connection = connection
    console.log('mainteiner added to ', this.name, ' room')
  }
  addViewer(connection){
    this.maintainer.tracks.forEach(track => connection.addTrack(track))
    this.viewers.push(connection)
    console.log('viewer added to ', this.name, ' room')
  }
  deleteRoom(){
    this.maintainer.connection.close()
    this.viewers.forEach(viewer => viewer.close())
    rooms.splice(
    rooms.findIndex( (room) => room.id === this.id )
    , 1)
  }
}


const RTCPeerConnection = require('wrtc').RTCPeerConnection;


class ConnectionController {    //реализация adonis
  constructor({socket, request}) {
    console.log('constructor')
    this.socket = socket
    this.request = request




    this.connection = new RTCPeerConnection({     //экземпляр RTCPeerConnection
      configuration:{
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      },
      sdpSemantics: 'unified-plan',
      iceServers: [     // Information about ICE servers - Use your own!
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    })

    this.connection.onicecandidate = async ({candidate}) => {     //событие появления ice кандидата
      this.socket.emit('candidate', candidate)
    }

    // this.connection.onconnectionstatechange = (e) => {
    //   console.log('state:',this.connection.connectionState)
    //   // if(this.connection.iceConnectionState === 'disconnected') {
    //   //   console.log('Disconnected');
    //   // }
    // }

    // ---------------------Тест канала данных - нужно для проверки соедининия---------
    let dc = this.connection.createDataChannel("channel");
    dc.onmessage = function (event) {
      console.log("received: " + event.data);
    };
    this.connection.ondatachannel = function (e) {
      dc = e.channel
      dc.send('to Client')
    }
    // ---------------------Тест канала данных - нужно для проверки соедининия---------





    let roomName = socket.topic.split(':')[1]
    let room =  rooms.find(function (room) {
      return room.name === roomName
    })
    if (room) {
      room.addViewer(this.connection)
    }
    else {
      let room = new Room(roomName)
      room.addMaintainer(this.connection)
    }
  }


  async onCandidate(candidate) {      //событие приема ice кандидата от сервера
    if (candidate) {
      await this.connection.addIceCandidate(candidate)
    }
  }

  async onSdp(offer) {        //событие приема sdp ответа от сервера
    await this.connection.setRemoteDescription(offer)
    let answer = await this.connection.createAnswer()
    await this.connection.setLocalDescription(answer)
    this.socket.emit('sdp', answer)
  }

}

module.exports = ConnectionController

