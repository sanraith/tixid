import { Component, OnInit, ViewChild, ComponentFactoryResolver, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse } from 'src/shared/socket';
import { RoomContentDirective } from './roomContentDirective';
import { LobbyComponent } from './lobby/lobby.component';
import RoomContentComponent from './roomContentComponent';
import RoomModel from '../models/roomModel';
import { CardsDisplayComponent } from './cards-display/cards-display.component';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {
  room: RoomModel = new RoomModel();

  @ViewChild(RoomContentDirective, { static: true })
  contentHost: RoomContentDirective;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomSocket: Socket,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  ngOnInit(): void {
    this.room.id = this.route.snapshot.paramMap.get('id');
    this.join();
  }

  ngOnDestroy(): void {
    this.leave();
  }

  showCardDisplay() :void{
    this.loadContent(CardsDisplayComponent);
  }

  private join(): void {
    this.roomSocket.connect();

    this.roomSocket.on(ClientEvents.playersChanged, (args: PlayersChangedData) => {
      this.room.owner = args.owner;
      this.room.players = args.players;
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
