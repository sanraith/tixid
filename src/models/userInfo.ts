interface UserCookies {
    "qind.userId": string;
    "qind.userSecret": string;
    "qind.userName": string;
}

export default class UserInfo {
    public id: string;
    public secret: string;
    public name: string;

    constructor(cookies: UserCookies) {
        this.id = cookies["qind.userId"];
        this.secret = cookies["qind.userSecret"];
        this.name = cookies["qind.userName"];
    }
}