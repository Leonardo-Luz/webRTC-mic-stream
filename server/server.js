const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });
let clients = [];

server.on('connection', (ws, req) => {
  const clientId = Date.now();
  const clientIP = req.socket.remoteAddress;
  const clientPort = req.socket.remotePort;

  clients.push({ ws, id: clientId, ip: clientIP, port: clientPort });

  console.log(`New Client connected: ${clientIP}:${clientPort}. Total Clients: ${clients.length}`);

  ws.on('message', (message) => {
    // Broadcast to other clients
    clients.forEach(client => {
      if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c.ws !== ws);
    console.log(`Client disconnected: ${clientId}. Total clients: ${clients.length}`);
  });
});

console.log('Signaling server running on ws://localhost:3000');
