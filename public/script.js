// frontend javascript code for managing video stream and webRTC connection

// if host leaves, meet ends

const socket = io('/')
let peer     = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});
const peers = {}
let myVideoStream
let message = $('input') 
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
    addVideoStream(myVideo, stream, peer.id, (sessionStorage.getItem("userdata") ? JSON.parse(sessionStorage.getItem("userdata")).name : "Guest"))

    peer.on('call', call => {
        call.answer(myVideoStream)
        call.on('stream', userVideoStream => {
            console.log("Streaming event after receiving call")

            const video = document.createElement('video')
            addVideoStream(video, userVideoStream, call.provider._id, "abcd")
        })
    })

    socket.on("user-connected", (userId, userName) => {
        console.log(`User ${userName} connected using ${userId}`)
        connectToNewUser(userId, userName, stream)
    })

}).catch(error => {
    alert("No video stream identified")
})

// peer and socket events
peer.on('open', (userId) => {
    console.log("Connected to peer server, ID - ", peer.id)
    socket.emit('join-room', ROOM_ID, userId, "karsh")
})

socket.on('user-disconnected', userId => {
    console.log(`User ${userId} disconnected`)
    // add toast here
    if (peers[userId]) peers[userId].close()
})



// helper functions
const addVideoStream = (video, stream, userId, userName) => {

    console.log("Adding video stream")
    video.srcObject = stream
    video.classList.add("video-element")
    video.setAttribute("data-userid", userId)
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoDiv = document.createElement("div")
    videoDiv.classList.add("video-div")

    videoLabel = document.createElement("label")
    videoLabel.classList.add("video-label")
    videoLabel.textContent = (userId == peer.id ? "(You) " : "") + userName

    videoDiv.append(videoLabel)
    videoDiv.append(video)
    videoGrid.append(videoDiv)
}

const connectToNewUser = (userId, userName, stream) => {
    console.log("Called New peer - ", userId)
    const call = peer.call(userId, stream)
    console.table(call)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        console.log("Send your own stream")
        addVideoStream(video, userVideoStream, userId, userName)
    })

    call.on('close', () => {
        console.log("closed")
        video.remove()
    })

    peers[userId] = call

}

const leaveMeeting = () => {
    socket.disconnect()

    // redirect to a page

}

const muteUnmute = () => {
    const audioMedia = myVideoStream.getAudioTracks();
    
    if (audioMedia.length == 0){
        alert("Audio is disabled for this meet")
        return false
    }
    
    const enabled = audioMedia[0].enabled

    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmuteButton()
    }
    else{
        myVideoStream.getAudioTracks()[0].enabled = true
        setMuteButton()
    }

}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {

    const videoTracks = myVideoStream.getVideoTracks()

    if (videoTracks.length == 0){
        alert("Video is disabled for this meet")
        return false        
    }

    let enabled = videoTracks[0].enabled;
    if (enabled) {
        videoTracks[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        videoTracks[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const scrollToBottomOfChat = () => {
    var d = $('.main__chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}


// room chatting logic

$('html').on('keydown', (e) => {
    if(e.which == 13 && message.val().length > 0 ){
        socket.emit('message', peer.id, message.val())
        console.log(message.val())
        message.val('')
    }
})

socket.on("broadcast-chat-message", (userId, message) => {
    $('ul').append(`<li class='message'><b>${userId}</b> ${message}</li>`)
    scrollToBottomOfChat()
})