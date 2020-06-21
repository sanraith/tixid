export default class UserInfo {
    /**
     * @param name The name of the user.
     * @param publicId The publicly visible id of the user.
     * @param privateId The private id of the user. Only visible for the user's own client. Used to identify the user.
     */
    constructor(public name: string, public publicId: string, public id: string) { }
}