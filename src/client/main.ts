declare function uuidv4(): string;

function setCookie(name: string, value: string, expireDays: number): void {
    var d = new Date();
    d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name: string): string {
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
    return "";
}

const userIdCookie = "qind.userId";
const userSecretCookie = "qind.userSecret";
const userNameCookie = "qind.userName";
let userInfo = {
    id: getCookie(userIdCookie),
    secret: getCookie(userSecretCookie),
    name: "Player"
};
if (!userInfo.id) { userInfo.id = uuidv4(); }
if (!userInfo.secret) { userInfo.secret = uuidv4(); }
setCookie(userIdCookie, userInfo.id, 365);
setCookie(userSecretCookie, userInfo.secret, 365);
setCookie(userNameCookie, userInfo.name, 365);
