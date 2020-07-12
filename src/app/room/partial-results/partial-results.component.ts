import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-partial-results',
  templateUrl: './partial-results.component.html',
  styleUrls: ['./partial-results.component.sass']
})
export class PartialResultsComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }

}
