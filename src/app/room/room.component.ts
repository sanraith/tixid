import { Component, OnInit, ViewChild, ComponentFactoryResolver, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse, PlayerStateChangedData } from 'src/shared/socket';
import { RoomContentDirective } from './roomContentDirective';
import { LobbyComponent } from './lobby/lobby.component';
import RoomContentComponent from './roomContentComponent';
import RoomModel, { GameState } from '../models/roomModel';
import { CardsDisplayComponent } from './cards-display/cards-display.component';
import { UserService } from '../services/user.service';
import { PrivatePlayerState } from 'src/shared/model/playerState';
import { Card } from 'src/shared/model/card';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {
  room: RoomModel = new RoomModel();
  isOwner: boolean;

  @ViewChild(RoomContentDirective, { static: true })
  contentHost: RoomContentDirective;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomSocket: Socket,
    private componentFactoryResolver: ComponentFactoryResolver,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.room.id = this.route.snapshot.paramMap.get('id')!;
    this.join();
  }

  ngOnDestroy(): void {
    this.leave();
  }

  showCardDisplay(): void {
    this.loadContent(CardsDisplayComponent);
  }

  startGame(): void {
    this.roomSocket.emit(ClientActions.startGame, {}, (resp: EmitResponse) => {
      if (resp.success) {
        // TODO load make story screen
      } else {
        alert(resp.message);
      }
    });
  }

  private async join(): Promise<void> {
    this.roomSocket.connect();

    this.roomSocket.on(ClientEvents.playersChanged, (args: PlayersChangedData) => {
      this.room.owner = args.owner;
      this.room.players = args.players;
      this.isOwner = true || this.userService.userData.id === this.room.owner.id;
    });

    this.roomSocket.on(ClientEvents.gameStarted, () => {
      this.room.game = new GameState();
    });

    this.roomSocket.on(ClientEvents.playerStateChanged, (args: PlayerStateChangedData) => {
      const game = this.room.game;
      const myData = <PrivatePlayerState>args.playerStates.find(x => x.userInfo.id === this.userService.userData.id);
      game.hand = myData.hand.map(id => new Card(id, id));
      for (const playerState of args.playerStates) {
        const localPlayerStateIndex = game.players.findIndex(x => x.userInfo.id === playerState.userInfo.id);
        if (localPlayerStateIndex >= 0) {
          game.players[localPlayerStateIndex] = playerState;
        } else {
          game.players.push(playerState);
        }
      }
    });

    this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: this.room.id }, (resp: EmitResponse) => {
      if (resp.success) {
        this.loadContent(LobbyComponent);
      } else {
        this.router.navigate(['home']);
      }
    });
  }

  private leave(): void {
    this.roomSocket.removeAllListeners();
    this.roomSocket.disconnect();
  }

  private loadContent(component: Type<RoomContentComponent>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const viewContainerRef = this.contentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.room = this.room;
  }
}
