import { Component, OnInit, ViewChild, ComponentFactoryResolver, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse, PlayerStateChangedData, GameStateChangedData } from 'src/shared/socket';
import { RoomContentDirective } from './roomContentDirective';
import { LobbyComponent } from './lobby/lobby.component';
import RoomContentComponent from './roomContentComponent';
import RoomModel, { PlayerState } from '../models/roomModel';
import { UserService } from '../services/user.service';
import { PrivatePlayerState } from 'src/shared/model/playerState';
import { Card } from 'src/shared/model/card';
import { MakeStoryComponent } from './make-story/make-story.component';
import { GameStep } from 'src/shared/model/gameStep';
import { ExtendStoryComponent } from './extend-story/extend-story.component';

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
    this.room.currentUser = this.userService.userData;
    this.room.id = this.route.snapshot.paramMap.get('id')!;
    this.join();
  }

  ngOnDestroy(): void {
    this.leave();
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
    this.roomSocket.on(ClientEvents.gameStarted, () => {
      this.room.playerState = new PlayerState();
    });

    this.roomSocket.on(ClientEvents.playersChanged, (args: PlayersChangedData) => {
      this.room.owner = args.owner;
      this.room.players = args.players;
      this.isOwner = true || this.room.currentUser.id === this.room.owner.id;
    });

    this.roomSocket.on(ClientEvents.playerStateChanged, (args: PlayerStateChangedData) => {
      const pState = this.room.playerState;
      const myData = <PrivatePlayerState>args.playerStates.find(x => x.userInfo.id === this.room.currentUser.id);
      if (myData) {
        pState.hand = myData.hand.map(id => new Card(id, id));
      }
      for (const playerState of args.playerStates) {
        const localPlayerStateIndex = pState.players.findIndex(x => x.userInfo.id === playerState.userInfo.id);
        if (localPlayerStateIndex >= 0) {
          pState.players[localPlayerStateIndex] = playerState;
        } else {
          pState.players.push(playerState);
        }
      }
    });

    this.roomSocket.on(ClientEvents.gameStateChanged, (newState: GameStateChangedData) => {
      const currentGameState = this.room.gameState;
      const newContent = this.pickRoomContent(currentGameState?.step, newState.step);
      this.room.gameState = newState;
      if (newContent) {
        this.loadContent(newContent);
      }
    });

    this.roomSocket.connect();
    this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: this.room.id }, (resp: EmitResponse) => {
      if (!resp.success) {
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

  private pickRoomContent(previousStep: GameStep | undefined, newStep: GameStep): Type<RoomContentComponent> | null {
    if (previousStep === newStep) {
      return null;
    }

    switch (newStep) {
      case GameStep.lobby: return LobbyComponent;
      case GameStep.makeStory: return MakeStoryComponent;
      case GameStep.extendStory: return ExtendStoryComponent;
      default: return null;
    }
  }
}
