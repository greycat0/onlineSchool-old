'use strict'


class Room {
  constructor() {

  }

  index({request, response}) {
    return `
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.4.4/polyfill.min.js"></script>
<script src="https://unpkg.com/@adonisjs/websocket-client"></script>
<script src='/index.js'></script>
</head>
<body></body>
</html>
`
  }
}


module.exports = Room
