import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';
import { GetRoomListResponse } from 'src/shared/responses';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.sass']
})
export class RoomListComponent implements OnInit {
  rooms: { id: string; owner: { name: string; }; players: { name: string; }[]; }[];

  constructor(private roomService: RoomService) { }

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms() {
    this.roomService.getRooms().subscribe(resp => this.rooms = resp.rooms);
  }
}
