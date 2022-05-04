// frontend javascript code for managing video stream and webRTC connection

let myVideoStream
const videoGrid = document.getElementById("video-grid")
const myVideo   = document.createElement('video')
myVideo.muted   = true  // mute your own video to avoid echo

// helper functions
const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

// detect video device and then play user video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)
}).catch(error => {
    console.log(error)
})
