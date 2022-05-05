// imports
const express = require('express')
const app     = express()
const server  = require('http').Server(app)
const io      = require('socket.io')(server)

const { ExpressPeerServer } = require('peer')
const peerServer            = ExpressPeerServer(server, {
    debug: true,
    proxied: true,
}) 

const {v4: uuidv4} = require('uuid')

var cors = require('cors')


// server configurations
app.use(cors())
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', (socket) =>{
    socket.on('join-room', (roomId, userId, userName) =>{
        socket.join(roomId)
        socket.to(roomId).emit("user-connected", userId, userName)
        socket.on('message', (userId, message) => {
            console.log({ userId, message })
            io.to(roomId).emit("broadcast-chat-message", userId, message)        
        })
    })

})

server.listen(3030)