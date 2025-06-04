const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

let connectedClients = [];

// Create HTTP + WebSocket Server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading UI');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const msg = new URLSearchParams(body).get('msg');
      console.log('📨 UI sent message to clients:', msg);

      connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`📢 From UI: ${msg}`);
        }
      });

      res.writeHead(200);
      res.end('Message sent to clients');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Attach WebSocket Server to HTTP Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 Client connected');
  connectedClients.push(ws);

  // Ping every 10 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('📡 Ping from server every 10 seconds');
    }
  }, 10000);

  ws.on('message', (message) => {
    console.log('📩 Received from client:', message.toString());
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clearInterval(interval);
    connectedClients = connectedClients.filter(client => client !== ws);
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket server + UI running at http://localhost:${PORT}`);
});
