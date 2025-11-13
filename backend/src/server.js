// src/server.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('presence:join', (data) => {
    socket.join('global');
    // Optionally store user mapping if auth token provided
    console.log('presence join', data);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// attach io to app so routes can emit
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
