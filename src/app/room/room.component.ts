import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData } from 'src/shared/socket';
import { PublicUserInfo } from 'src/shared/publicUserInfo';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {
  id: string;
  owner: PublicUserInfo;
  players: PublicUserInfo[];

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
    this.roomSocket.on(ClientEvents.playersChanged, (args: PlayersChangedData) => {
      this.owner = args.owner;
      this.players = args.players;
    });
    this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: this.id });
  }

  private leave(): void {
    this.roomSocket.removeAllListeners();
    this.roomSocket.disconnect();
  }
}
