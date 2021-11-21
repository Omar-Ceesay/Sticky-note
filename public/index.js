const input = document.getElementById("goToRoom")

input.addEventListener('input', handleUpdate);

function handleUpdate(e) {
    if (e.target.value.length > 0) {
        document.getElementById("goToRoomBtn").disabled = false;
    } else {
        document.getElementById("goToRoomBtn").disabled = true;
    }
}

function goToRoom() {
    window.location.href = "/room/"+input.value;
}