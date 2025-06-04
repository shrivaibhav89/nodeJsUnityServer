const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (ws) => {
  console.log('🔌 Client connected');

  // Send a message every 10 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('📡 Ping from server every 10 seconds');
    }
  }, 10000); // 10000 ms = 10 seconds

  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString());

    // Respond back immediately
    ws.send('Hello from Node.js!');
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clearInterval(interval); // Stop sending messages
  });
});

console.log(`✅ WebSocket server is running at ws://localhost:${PORT}`);
