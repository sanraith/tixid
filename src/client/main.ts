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
    return getCookie(userNameCookie);
}

let userInfo = {
    id: getCookie(userIdCookie) ?? uuidv4(),
    secret: getCookie(userSecretCookie) ?? uuidv4(),
    name: getCookie(userNameCookie) ?? "Player"
};
setCookie(userIdCookie, userInfo.id, 365);
setCookie(userSecretCookie, userInfo.secret, 365);
setCookie(userNameCookie, userInfo.name, 365);
