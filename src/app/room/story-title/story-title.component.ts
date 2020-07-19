import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-story-title',
  templateUrl: './story-title.component.html',
  styleUrls: ['./story-title.component.sass']
})
export class StoryTitleComponent implements OnInit, RoomContentComponent {
  @Input() room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }

}
