import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-vote-story-results',
  templateUrl: './vote-story-results.component.html',
  styleUrls: ['./vote-story-results.component.sass']
})
export class VoteStoryResultsComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }

}
