import 'dotenv/config.js'  // to use envt variables
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const port = process.env.PORT || 3000;


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Authenticate Socket.io using token
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
})

io.on('connection', socket => {

  console.log('A user connected');

  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(port, () => {
    console.log('Server is running on port 3000');
}); 

