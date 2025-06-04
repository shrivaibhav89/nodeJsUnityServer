const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (ws) => {
  console.log('🔌 Client connected');

  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString());

    // Respond back
    ws.send('Hello from Node.js!');
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

console.log(`✅ WebSocket server is running at ws://localhost:${PORT}`);
