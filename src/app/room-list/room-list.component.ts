import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../services/room.service';
import { PublicUserInfo } from 'src/shared/model/publicUserInfo';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.sass']
})
export class RoomListComponent implements OnInit {
  rooms: { id: string; name:string, owner: PublicUserInfo; players: PublicUserInfo[]; }[];

  constructor(
    private router: Router,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms() {
    this.roomService.getRooms().subscribe(resp => this.rooms = resp.rooms);
  }

  joinRoom(id: string) {
    this.router.navigate(['room', id]);
  }
}
