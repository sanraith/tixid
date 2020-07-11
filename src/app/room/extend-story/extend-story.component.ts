import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Card } from 'src/shared/model/card';

@Component({
  selector: 'app-extend-story',
  templateUrl: './extend-story.component.html',
  styleUrls: ['./extend-story.component.sass']
})
export class ExtendStoryComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;
  extendCard: Card;

  constructor() { }

  ngOnInit(): void {
  }

}
