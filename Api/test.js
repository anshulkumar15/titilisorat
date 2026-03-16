const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const timerInterval = 1000; // Timer interval in milliseconds (1 second in this example)
let countdownDuration = 4; // Initial countdown value

let timer; // Variable to store the timer

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Emit the start event and the current countdown value
  socket.emit('startEvent', { message: 'Timer started', countdown: countdownDuration });

  // Start the timer if not already running
  if (!timer) {
    timer = setInterval(() => {
      try {
        if (countdownDuration <= 0) {
          // Reset the countdown to the initial value
          countdownDuration = 4;
        } else {
          countdownDuration--;
        }

        io.emit('timerEvent', { message: 'Countdown', countdown: countdownDuration });

        // Check if the countdown has reached 0
        if (countdownDuration === 0) {
          // Emit the end event when the timer reaches 0
          io.emit('endEvent', { message: 'Timer ended' });
        }
      } catch (error) {
        console.error('Error in timer:', error.message);
        // Clear the timer to avoid further issues
        clearInterval(timer);
        timer = null;
      }
    }, timerInterval);
  }

  // Handle disconnecting
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Clear the timer when the last socket disconnects
    if (io.engine.clientsCount === 0) {
      clearInterval(timer);
      timer = null;
      countdownDuration = 4; // Reset countdown on disconnect
    }
  });

  // Handle connecting socket
  socket.on('connectSocket', () => {
    console.log(`Socket connected: ${socket.id}`);
    // Emit the current countdown value to the new socket
    socket.emit('startEvent', { message: 'Timer started', countdown: countdownDuration });
  });

  // Handle disconnecting socket
  socket.on('disconnectSocket', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    socket.disconnect();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const path = require('path');

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname + '/local.html'));
});

 