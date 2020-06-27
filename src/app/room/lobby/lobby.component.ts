import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;
  
  constructor() { }

  ngOnInit(): void {
  }

}
