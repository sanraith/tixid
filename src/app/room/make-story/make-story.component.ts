import { Component, OnInit, Input } from '@angular/core';
import RoomModel from 'src/app/models/roomModel';
import RoomContentComponent from '../roomContentComponent';
import { Card } from 'src/shared/model/card';
import { ClientActions, MakeStoryData, EmitResponse } from 'src/shared/socket';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-make-story',
  templateUrl: './make-story.component.html',
  styleUrls: ['./make-story.component.sass']
})
export class MakeStoryComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;

  story?: string;
  storyCard?: string;

  constructor(private roomSocket: Socket) { }

  ngOnInit(): void { }

  sendStory(): void {
    this.roomSocket.emit(ClientActions.makeStory, <MakeStoryData>{
      story: this.story,
      cardId: this.storyCard
    }, (resp: EmitResponse) => {
      if (!resp.success) {
        alert(`Error: ${resp.message}`);
      }
    });
  }
}
