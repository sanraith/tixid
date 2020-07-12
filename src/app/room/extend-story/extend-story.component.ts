import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Card } from 'src/shared/model/card';
import { Socket } from 'ngx-socket-io';
import { ClientActions, ExtendStoryData, EmitResponse } from 'src/shared/socket';

@Component({
  selector: 'app-extend-story',
  templateUrl: './extend-story.component.html',
  styleUrls: ['./extend-story.component.sass']
})
export class ExtendStoryComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;
  extendCard: string;
  alreadySubmittedCard: boolean = false;

  constructor(private socket: Socket) { }

  ngOnInit(): void {
  }

  extendStory(): void {
    this.alreadySubmittedCard = true;
    this.socket.emit(ClientActions.extendStory, <ExtendStoryData>{ cardId: this.extendCard }, (resp: EmitResponse) => {
      if (!resp.success) {
        this.alreadySubmittedCard = false;
        alert(`Error: ${resp.message}`);
      }
    });
  }
}
