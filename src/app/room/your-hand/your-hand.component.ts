import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-your-hand',
  templateUrl: './your-hand.component.html',
  styleUrls: ['./your-hand.component.sass']
})
export class YourHandComponent implements OnInit, RoomContentComponent {
  @Input() room: RoomModel;

  constructor() { }

  ngOnInit(): void {
  }

}
