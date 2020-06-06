declare function uuidv4(): string;

function setCookie(name: string, value: string, expireDays: number = 365): void {
    var d = new Date();
    d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name: string): string | undefined {
    var name = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}

const userIdCookie = "qind.userId";
const userSecretCookie = "qind.userSecret";
const userNameCookie = "qind.userName";

function updateUserNameCookie() {
    const inputBox = <HTMLInputElement>document.getElementById("userNameTextBox");
    setCookie(userNameCookie, inputBox.value);
    updateUserNameField();
}

function updateUserNameField() {
    const inputBox = <HTMLInputElement>document.getElementById("userNameTextBox");
    inputBox.value = getCookie(userNameCookie);
}

function postRequest(url: string, completeCallback: (request: XMLHttpRequest, event: Event) => any) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function (event: Event) {
        if (this.readyState == 4 && this.status == 200) {
            completeCallback.call(request, request, event);
        }
    }
    request.open("POST", url, true);
    request.send();
}

function createRoom() {
    postRequest("/rooms/create", (request) => {
        let room: { id: string | undefined } = { id: undefined };
        try { room = JSON.parse(request.responseText); } catch { }

        if (room.id) {
            window.location.href = `/rooms/${room.id}`;
        } else {
            console.log(`Cannot create room with this response: ${request.responseText}`);
            alert("An error occurred while creating the room.");
        }
    });
}

let userInfo = {
    id: getCookie(userIdCookie) ?? uuidv4(),
    secret: getCookie(userSecretCookie) ?? uuidv4(),
    name: getCookie(userNameCookie) ?? "Player"
};
setCookie(userIdCookie, userInfo.id, 365);
setCookie(userSecretCookie, userInfo.secret, 365);
setCookie(userNameCookie, userInfo.name, 365);
