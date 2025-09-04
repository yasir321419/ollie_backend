function sendMessage(ws, type, data = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      ...data
    }));
  }
}

function broadcastMessage(clients, type, data = {}) {
  const message = JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    ...data
  });

  clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

function handleWebSocketError(ws, error, context = '') {
  console.error(`WebSocket error ${context}:`, error);
  
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'An error occurred',
      timestamp: new Date().toISOString()
    }));
  }
}

module.exports = {
  sendMessage,
  broadcastMessage,
  handleWebSocketError
};