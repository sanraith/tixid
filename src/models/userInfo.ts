interface UserCookies {
    "qind.userId": string;
    "qind.userSecret": string;
    "qind.userName": string;
}

export default class UserInfo {
    constructor(public name: string, public publicId: string, public id: string) { }

    static createFrom(cookies: UserCookies) {
        return new UserInfo(cookies["qind.userName"], cookies["qind.userId"], cookies["qind.userSecret"])
    }
}