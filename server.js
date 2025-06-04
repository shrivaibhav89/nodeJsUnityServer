const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let players = [];
let currentTurnIndex = 0;
let scores = {};

function getPlayerBySocket(ws) {
  return players.find(p => p.socket === ws);
}

function broadcast(data) {
  players.forEach(p => {
    if (p.socket.readyState === WebSocket.OPEN) {
      p.socket.send(JSON.stringify(data));
    }
  });
}
// Set interval to send ping to each client every 30 seconds
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(); // Send ping to client
  });
}, 30000);

function broadcastGameState() {
  broadcast({
    type: 'turn',
    message: `${players[currentTurnIndex].id}'s turn`,
    scores,
  });
}

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game full' }));
    ws.close();
    return;
  }

  const playerId = `player${players.length + 1}`;
  players.push({ id: playerId, socket: ws });
  scores[playerId] = 0;

  ws.send(JSON.stringify({ type: 'info', message: `Welcome ${playerId}`, playerId }));

  console.log(`✅ ${playerId} connected`);

  if (players.length === 2) {
    broadcastGameState();
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const player = getPlayerBySocket(ws);

      if (!player) return;

      if (data.type === 'roll') {
        if (players[currentTurnIndex].socket !== ws) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not your turn!' }));
          return;
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        scores[player.id] += roll;

        broadcast({
          type: 'roll_result',
          player: player.id,
          rolled: roll,
          scores,
        });

        // Next player's turn
        currentTurnIndex = (currentTurnIndex + 1) % players.length;
        broadcastGameState();
      }
    } catch (err) {
      console.log('❌ Error parsing message:', err.message);
    }
  });

  ws.on('close', () => {
    const index = players.findIndex(p => p.socket === ws);
    if (index !== -1) {
      console.log(`❌ ${players[index].id} disconnected`);
      players.splice(index, 1);
    }
    scores = {};
    currentTurnIndex = 0;
    players.forEach(p => {
      p.socket.send(JSON.stringify({ type: 'info', message: 'Other player disconnected. Restart game.' }));
      p.socket.close();
    });
    players = [];
  });
});

server.listen(PORT, () => {
  console.log(`🎲 Dice Game Server running at ws://localhost:${PORT}`);
});
