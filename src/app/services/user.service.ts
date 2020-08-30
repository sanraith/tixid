import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { v4 as uuid } from 'uuid';

export interface ClientUser {
    name: string,
    id: string,
    secret: string,
    isNamePersonalized: boolean
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private cookieService: CookieService) { }

    get userData(): ClientUser {
        if (!this._user) {
            this.loadOrGenerateUserData();
        }
        return this._user;
    }

    save() {
        Object.keys(this._user).map(k => this.cookieService.delete(this.getCookieName(k)));
        Object.keys(this._user).map(k => this.cookieService.set(this.getCookieName(k), this._user[k], 365 * 10, '/'));
        this.loadOrGenerateUserData();
    }

    private loadOrGenerateUserData(): void {
        if (!this._user) {
            this._user = {
                name: 'Player',
                id: uuid(),
                secret: uuid(),
                isNamePersonalized: false
            };
        }

        const userDataExists = Object.keys(this._user).every(k => this.cookieService.check(this.getCookieName(k)));
        if (userDataExists) {
            Object.keys(this._user).map(k => {
                let value: any = this.cookieService.get(this.getCookieName(k));
                switch (typeof this._user[k]) {
                    case 'boolean': this._user[k] = value === 'true'; break;
                    default: this._user[k] = value; break;
                }
            });
        } else {
            this.save();
        }
    }

    private getCookieName(name: string): string { return `tixid.user.${name}`; }

    private _user?: ClientUser;
}
