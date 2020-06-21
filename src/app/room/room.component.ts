import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents } from 'src/shared/socket';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {
  id: string;
  players: { name: string }[];

  constructor(
    private route: ActivatedRoute,
    private roomSocket: Socket) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.join();
  }

  ngOnDestroy(): void {
    this.leave();
  }

  private join(): void {
    this.roomSocket.connect();
    this.roomSocket.on(ClientEvents.playersChanged, (players: { name: string; }[]) => this.players = players);
    this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: this.id });
  }

  private leave(): void {
    this.roomSocket.removeAllListeners();
    this.roomSocket.disconnect();
  }
}
