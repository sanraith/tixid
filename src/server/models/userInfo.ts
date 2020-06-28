import { PublicUserInfo } from '../../shared/model/publicUserInfo';

export default class UserInfo {
    /**
     * @param name The name of the user.
     * @param publicId The publicly visible id of the user.
     * @param privateId The private id of the user. Only visible for the user's own client. Used to identify the user.
     */
    constructor(name: string, publicId: string, public id: string) {
        this._name = name;
        this._publicId = publicId;
        this._publicInfo = new PublicUserInfo(name, publicId);
    }

    get name(): string { return this._name; }
    set name(value: string) {
        this._name = value;
        this.updatePublicInfo();
    }

    get publicId(): string { return this._publicId; }
    set publicId(value: string) {
        this._publicId = value;
        this.updatePublicInfo();
    }

    get publicInfo() { return this._publicInfo; }

    copyTo(target: UserInfo) {
        target.name = this.name;
        target.id = this.id;
        target.publicId = this.publicId;
    }

    private updatePublicInfo(): void {
        this._publicInfo = new PublicUserInfo(this.name, this.publicId);
    }

    private _name: string;
    private _publicId: string;
    private _publicInfo: PublicUserInfo;
}