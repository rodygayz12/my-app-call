const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('call', () => {
    io.emit('incomingCall');
  });

  socket.on('answer', () => {
    io.emit('startCall');
  });

  socket.on('endCall', () => {
    io.emit('callEnded');
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
