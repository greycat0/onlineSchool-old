'use strict'

let rooms = []

class Room {
  constructor(id, name = 'untitled') {
    this.id = id
    this.name = name
    this.maintainer = null
    this.viewers = []

    rooms.push(this)
    console.log(`room created with name:${this.name}, id:${this.id}`)
  }

  addMaintainer(connection) {

    this.maintainer = connection
    this.maintainer.tracks = []

    this.startLive()

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'disconnected' ||
        connection.connectionState === 'failed') {
        this.unplugMaintainer()
        this.deleteRoom()
      }
    }

    connection.websocket.on('close', () => {
      connection.websocket = null
    })

    connection.websocket.on('error', () => {
      connection.websocket = null
    })

    // connection.websocket.on('close', () => {
    //   this.deleteRoom()  //this.unplugMaintainer()
    // })
    console.log('mainteiner added to ', this.id, ' room')
  }

  startLive() {
    this.maintainer.ontrack = (e) => {
      if (e.track.kind === 'video') {
        this.maintainer.addTrack(e.track)   //TODO
      }
      this.viewers.forEach(viewer => {
        if (viewer.getSenders().length === 0) {
          viewer.addTrack(e.track)
        }
      })
      this.maintainer.tracks.push(e.track)
      console.log('main track!!!')
    }
  }

  unplugMaintainer() {
    if (this.maintainer) {
      this.maintainer.close()
      this.viewers.forEach(viewer => {
        if (viewer.websocket) {
          viewer.websocket.emit('maintainer left')
        }
      })
      this.maintainer = null
      console.log('maintainer left')
    }
  }

  addViewer(connection) {
    this.maintainer.tracks.forEach(track => connection.addTrack(track))
    this.viewers.push(connection)

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'disconnected' ||
        connection.connectionState === 'failed') {
        // this.deleteRoom()  //this.unplugMaintainer()
        this.unplugViewer(connection)
      }
    }

    connection.websocket.on('close', () => {
      connection.websocket = null
    })

    connection.websocket.on('error', () => {
      connection.websocket = null
    })

    // connection.websocket.on('close', () => {
    //   this.unplugViewer(connection)
    // })

    console.log('viewer added to ', this.id, ' room')
  }

  unplugViewer(connection) {
    connection.close()
    this.viewers.splice(this.viewers.indexOf(connection), 1)
    console.log('viewer disconnected')
  }

  deleteRoom() {
    if (this.maintainer) {
      this.maintainer.close()
      if (this.maintainer.websocket) {
        this.maintainer.websocket.close()
        this.maintainer.websocket = null
      }
    }

    this.viewers.forEach(viewer => {
      viewer.close()
      if (viewer.websocket) {
        viewer.websocket.close()
        viewer.websocket = null
      }
    })
    rooms.splice(
      rooms.findIndex((room) => room.id === this.id)
      , 1)
    console.log(`room ${this.id} deleted`);
  }
}

exports.Room = Room
exports.rooms = rooms
