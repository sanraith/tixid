import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { uuid } from 'uuidv4';

interface User {
  name: string,
  id: string,
  secret: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private cookieService: CookieService) { }

  get userData(): User {
    if (!this._user) {
      this.loadOrGenerateUserData();
    }
    return this._user;
  }

  save() {
    Object.keys(this._user).map(k => this.cookieService.set(this.getCookieName(k), this._user[k]));
    this.loadOrGenerateUserData();
  }

  private loadOrGenerateUserData(): void {
    if (!this._user) {
      this._user = {
        name: 'Player',
        id: uuid(),
        secret: uuid()
      };
    }

    const userDataExists = Object.keys(this._user).every(k => this.cookieService.check(this.getCookieName(k)));
    if (userDataExists) {
      Object.keys(this._user).map(k => this._user[k] = this.cookieService.get(this.getCookieName(k)));
    } else {
      this.save();
    }
  }

  private getCookieName(name: string): string { return `tixid.user.${name}`; }

  private _user?: User;
}
