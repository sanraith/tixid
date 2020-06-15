import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  isCreatingRoom: boolean = false;

  constructor(
    private roomService: RoomService,
    private router: Router) { }

  ngOnInit(): void {
  }

  createRoomClick(): void {
    this.isCreatingRoom = true;
    this.roomService.createRoom().subscribe(resp => {
      this.isCreatingRoom = false;
      this.router.navigate(['room', resp.id]);
    });
  }
}
