import { WebSocketServer, WebSocket } from 'ws'

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        client.send(JSON.stringify(payload));
    }
}

export function attachWebsocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024
    })

    wss.on('connection', (socket) => {
        socket.isAlive = true;  // added
        socket.on('pong', () => { socket.isAlive = true; });  // added

        sendJson(socket, { type: 'welcome' });

        socket.on('error', console.error);
    });

    // added: ping every 30s, terminate unresponsive clients
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));  // added: cleanup on server close

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated }
}