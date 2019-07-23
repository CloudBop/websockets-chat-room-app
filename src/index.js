const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')

//
const app = express()
// create server outside of express lib
const server = http.createServer(app)
// because socketio needs to be called with server!
const io = socketio(server)

const port = process.env.PORT || 3000
// static files
const publicDirectoryPath = path.join(__dirname,'../public')

// let count = 0;

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment 

io.on('connection', (socket) => {
    // console.log('new web socket connection')
    socket.on('join', ( options, callback )=>{
        //
        const { error, user } = addUser( {id: socket.id, ...options} )

        if (error){
            return callback(error)
        }
        //
        socket.join(user.room)
        //
        // emit to this singular client
        socket.emit('message', generateMessage('Admin','Welcome'));
        // broadcast to all sockets except the callee
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        // to all users
        io.to(user.room).emit(`roomData`, {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    // broadcast to all connected clients
    socket.on('sendMessage', (message, callback )=>{
        const user = getUser(socket.id);
        // use filter library for profanitys
        const filter = new Filter()

        if( filter.isProfane(message) ){
            return callback(`Profanity is not allowed!`)
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        // callback delivered to initial socket
        callback()
    })
    //
    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${coords.lat},${coords.lon}`))

        callback('Your location has been shared')
    })
    // send message to all clients when user leaves
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        //
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            // to all users
            io.to(user.room).emit(`roomData`, {
                room: user.room,
                users: getUsersInRoom(user.room)
        })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on port:'+port)
})