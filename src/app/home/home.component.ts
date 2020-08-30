import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
    isCreatingRoom: boolean = false;
    userName: string;
    roomName: string;

    constructor(
        private roomService: RoomService,
        private userService: UserService,
        private router: Router) { }

    ngOnInit(): void {
        this.userName = this.userService.userData.name;
    }

    onCreateRoomClick(): void {
        if (this.isCreatingRoom || !this.roomName) {
            return;
        }

        this.isCreatingRoom = true;
        this.roomService.createRoom(this.roomName).subscribe(resp => {
            this.isCreatingRoom = false;
            this.router.navigate(['room', resp.id]);
        });
    }

    onUserNameInput(): void {
        if (this.userName) {
            this.userService.userData.name = this.userName;
            this.userService.save();
        }
    }

    onEnter(event: any, onEnterFunc: () => void) {
        if (event.keyCode === 13) {
            onEnterFunc.apply(this);
        }
    }
}
