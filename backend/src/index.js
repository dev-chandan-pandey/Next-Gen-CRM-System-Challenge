require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { authenticateJWT } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', authenticateJWT.optional, leadRoutes); // some lead endpoints require auth, others optional

app.get('/', (req, res) => res.json({ ok: true, msg: 'NextGen CRM backend' }));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('presence:join', (data) => {
    // client can send auth token for identification if desired
    console.log('presence join', data);
    socket.join('global');
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// make io accessible to routes/controllers
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
