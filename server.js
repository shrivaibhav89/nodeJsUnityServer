// server.js
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer();

// Create Socket.IO server attached to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',  // Allow Unity to connect from any domain
  }
});

// Listen for client connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle messages from the client
  socket.on('messageFromUnity', (data) => {
    console.log('Received from Unity:', data);

    // Optional: send a response back
    socket.emit('messageFromServer', 'Hello from Node.js!');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
