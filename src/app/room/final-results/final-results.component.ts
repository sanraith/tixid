import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-final-results',
  templateUrl: './final-results.component.html',
  styleUrls: ['./final-results.component.sass']
})
export class FinalResultsComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }
}
