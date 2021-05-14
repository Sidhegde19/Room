/*
This is the code for the server side of the project
*/

// importing all the libraries
const express = require('express');      
const app = express();

// creating a http instance on top of express
const server = require('http').Server(app);
const io = require('socket.io')(server);

//creating an express peer server
var ExpressPeerServer = require('peer').ExpressPeerServer;

// checks for available ports or uses 3000 as the default
const port = process.env.PORT||3000 

console.log(`Server running on http://localhost:${port}`);

const peerServer = {
  debug: true
};

// used to create random and unique room ids
const { v4: uuidV4 } = require('uuid');

// peerjs is the path that the peerjs server will be connected to 
app.use('/peerjs', ExpressPeerServer(server,peerServer));

// set to the view engine as ejs(embedded javascript) which lets you generate HTML markup with plain JS
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {   // redirects to room as of now
  res.redirect(`/${uuidV4()}`)
})


app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

// listening on port 
server.listen(port)