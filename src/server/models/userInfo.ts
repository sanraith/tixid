interface UserCookies {
    "tixid.user.id": string;
    "tixid.user.secret": string;
    "tixid.user.name": string;
}

export default class UserInfo {
    /**
     * @param name The name of the user.
     * @param publicId The publicly visible id of the user.
     * @param privateId The private id of the user. Only visible for the user's own client. Used to identify the user.
     */
    constructor(public name: string, public publicId: string, privateId: string) {
        this.#id = privateId;
    }

    /**
     * Returns true if the *private* id of the instances are equal.
     * @param other The other user info.
     */
    idEquals(other: UserInfo): boolean {
        return other && this.#id === other.#id;
    }

    /**
     * Generates an instance based on a cookie object containing the following properties:
     * "tixid.user.name" => name;
     * "tixid.user.id" => public id;
     * "tixid.user.secret" => private id;
     * @param cookies The cookie containing the user data.
     */
    static createFrom(cookies: UserCookies) {
        return new UserInfo(cookies["tixid.user.name"], cookies["tixid.user.id"], cookies["tixid.user.secret"]);
    }

    #id: string;
}