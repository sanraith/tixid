import UserInfo from '../models/userInfo';

export interface UserCookies {
    "tixid.user.id": string;
    "tixid.user.secret": string;
    "tixid.user.name": string;
}

class UserManager {
    getUserByPrivateId(id: string) {
        return this.users[id];
    }

    getUserFromCookies(cookies: UserCookies): UserInfo {
        const userInfo = this.createUserFrom(cookies);
        let existingUser = this.users[userInfo.id];
        if (existingUser) {
            Object.keys(userInfo).map((k => existingUser[<keyof UserInfo>k] = userInfo[<keyof UserInfo>k]));
        } else {
            this.users[userInfo.id] = userInfo;
            existingUser = userInfo;
        }

        return existingUser;
    }

    isCookiesContainUserInfo(cookie: UserCookies): boolean{
        const user = this.createUserFrom(cookie);
        return Object.keys(user).every((k => user[<keyof UserInfo>k]));
    }

    /**
     * Generates an instance based on a cookie object containing the following properties:
     * "tixid.user.name" => name;
     * "tixid.user.id" => public id;
     * "tixid.user.secret" => private id;
     * @param cookies The cookie containing the user data.
     */
    private createUserFrom(cookies: UserCookies) {
        return new UserInfo(cookies["tixid.user.name"], cookies["tixid.user.id"], cookies["tixid.user.secret"]);
    }

    private readonly users: { [key: string]: UserInfo } = {};
}

export default new UserManager();