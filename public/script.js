// frontend javascript code for managing video stream and webRTC connection

const socket = io('/')
let peer     = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});
let myVideoStream
const videoGrid = document.getElementById("video-grid")
const myVideo   = document.createElement('video')
myVideo.setAttribute("data-selfVideo", "yes")
myVideo.muted   = true  // mute your own video to avoid echo


// detect video device and then play user video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
}).then(stream => {
    myVideoStream = stream
    console.log("Adding your own Video stream")
    addVideoStream(myVideo, stream)

    socket.on("user-connected", (userId, userName) => {
        console.log(`User ${userName} connected using ${userId}`)
        connectToNewUser(userId, stream)
    })

}).catch(error => {
    console.log(error)
})

// peer and socket events
peer.on('open', (userId) => {
    console.log("Connected to peer server, ID - ", peer.id)
    socket.emit('join-room', ROOM_ID, userId, "karsh")
})

peer.on('call', call => {
    call.answer(myVideoStream)
    console.table(call)
    call.on('stream', userVideoStream => {
        console.log("Streaming event after receiving call")
        const video = document.createElement('video')
        addVideoStream(video, userVideoStream)
    })
})

// helper functions
const addVideoStream = (video, stream) => {
    console.log("Adding video stream")
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const connectToNewUser = (userId, stream) => {
    console.log("Called New peer - ", userId)
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        console.log("Send your own stream")
        addVideoStream(video, userVideoStream)
    })
}