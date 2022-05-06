function joinNewMeeting() {
    let name = $("#username").val()
    let email = $("#useremail").val()

    if(name == "" || name == undefined){
        alert("Please enter valid name")
        return
    }

    if(!validateEmail(email)){
        alert("Invalid Email")
        return
    }

    localStorage.setItem("userdata", JSON.stringify({ name: name, email: email }) )

    fetch('/generate-new-meeting-link').then(
        response => {
            response.text().then(
                meetingLink => {
                    window.location.href = `/${meetingLink}`
                })
        }
    ).catch(
        error => {
            alert('Error in generating Meeting')
        }
    )

}

function joinExistingMeeting() {
    let name = $("#username").val()
    let email = $("#useremail").val()

    if(name == "" || name == undefined){
        alert("Please enter valid name")
        return
    }

    if(!validateEmail(email)){
        alert("Invalid Email")
        return
    }

    localStorage.setItem("userdata", JSON.stringify({ name: name, email: email }) )

    let meetingLink = $("#meeting-link").val()

    window.location.href = `/${meetingLink}`

}

function validateEmail(email){
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    
}