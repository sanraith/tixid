import { Component } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'tixid';

  constructor(private userService: UserService) { }

  impersonate(name: string, publicId: string, secret: string) {
    this.userService.userData.name = name;
    this.userService.userData.id = publicId;
    this.userService.userData.secret = secret;
    this.userService.save();
  }
}
