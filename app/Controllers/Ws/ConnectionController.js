'use strict'

const RTCPeerConnection = require('wrtc').RTCPeerConnection;
let Room = require('../../Custom/Room').Room
let rooms = require('../../Custom/Room').rooms



class ConnectionController {    //реализация adonis
  constructor({socket, request}) {
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

    this.connection.websocket = this.socket

    // // ---------------------Тест канала данных - нужно для проверки соедининия---------
    // let dc = this.connection.createDataChannel("channel");
    // dc.onmessage = function (event) {
    //   console.log("received: " + event.data);
    // };
    // this.connection.ondatachannel = function (e) {
    //   dc = e.channel
    //   dc.send('to Client')
    // }
    // // ---------------------Тест канала данных - нужно для проверки соедининия---------


    let roomID = socket.topic.split(':')[1]
    let room =  rooms.find(function (room) {
      return room.id === roomID
    })
    if (room) {
      room.addViewer(this.connection)
    }
    else {
      let room = new Room(roomID)
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

