const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const mongoClient = require('mongodb').MongoClient;
const expressServer = express();
const server = http.Server(expressServer);
const port = process.env.PORT || 3000;
const io = socketIO(server);
const mongodb = new mongoClient('mongodb://localhost:27017', { useNewUrlParser: true });
const mongoInit = new Promise((resolve, reject) => {
    mongodb.connect()
        .then(() => resolve(mongodb.db('socket-db').collection('messageLogs')))
        .catch(error => reject(error));
});

expressServer.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
expressServer.use('/assets/js', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));
expressServer.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

mongoInit.then(collection => {
    io.on('connection', (socket) => {
        io.emit('status', { id: socket.id, msg: `Login.` });
        socket.on('message', async msg => {
            const message = { id: socket.id, msg: msg };
            io.emit('message', message);
            collection.insertOne(message);
        });
        socket.on('disconnect', () => {
            io.emit('status', { id: socket.id, msg: `Logout.` });
        });
    });
}).catch(error => console.log(error.message));

server.listen(port, _ => console.log(`Server is started port : ${port}`));