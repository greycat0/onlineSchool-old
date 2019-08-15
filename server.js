'use strict'
const http = require('http')
const https = require('https')
const pem = require('pem')
/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/
const { Ignitor } = require('@adonisjs/ignitor')


pem.createCertificate({ days: 1, selfSigned: true }, (error, keys) => {
  if (error) {
    return console.log(error)
  }

  const options = {
    key: keys.serviceKey,
    cert: keys.certificate
  }

  new Ignitor(require('@adonisjs/fold'))
    .appRoot(__dirname)
    .wsServer()
    .fireHttpServer((handler) => {

      let server = new http.Server()
      server.listen(process.env.HTTP_PORT, process.env.HOST)
      server.on('request', (req, res) => {
        const hostName = req.headers.host.split(':')[0]
        res.writeHead(302, {
          Location: `https://${hostName}:${process.env.PORT}${req.url}`
        })
        res.end()
      })

      return https.createServer(options, handler)
    })
    .catch(console.error)
})
