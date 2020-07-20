import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-pre-join',
  templateUrl: './pre-join.component.html',
  styleUrls: ['./pre-join.component.sass']
})
export class PreJoinComponent implements RoomContentComponent, OnInit {
  @Input() room: RoomModel;
  userName: string;
  isEdited: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userName = this.userService.userData.isNamePersonalized ? this.userService.userData.name : '';
  }

  onUserNameInput() {
    if (this.userName && this.userName.length > 0) {
      this.isEdited = true;
      this.userService.userData.name = this.userName;
      this.userService.userData.isNamePersonalized = true;
      this.userService.save();
    }
  }

  onEnter(event: any, onEnterFunc: () => void) {
    if (event.keyCode === 13) {
      onEnterFunc.apply(this);
    }
  }

  continue() {
    if (this.userName && this.userName.length > 0 && this.isEdited) {
      location.reload();
    }
  }
}
