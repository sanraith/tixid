import { Component, OnInit, Input } from '@angular/core';
import RoomModel from 'src/app/models/roomModel';
import RoomContentComponent from '../roomContentComponent';

@Component({
  selector: 'app-make-story',
  templateUrl: './make-story.component.html',
  styleUrls: ['./make-story.component.sass']
})
export class MakeStoryComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }

}
