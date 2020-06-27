export class PublicUserInfo {
    constructor(public name: string, public id: string) {
        this._cannotCastUserInfoIntoPublicUserInfo();
    }

    /** Prevents type compatibility with UserInfo. */
    private _cannotCastUserInfoIntoPublicUserInfo(): void { }
}