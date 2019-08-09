const Ws = use('Ws')

Ws.channel('rooms:*', 'ConnectionController')
