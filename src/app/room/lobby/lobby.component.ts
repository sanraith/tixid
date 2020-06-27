import { Component, OnInit } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements RoomContentComponent, OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
