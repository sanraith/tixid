import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Rules, getDefaultRules, } from 'src/shared/model/rules';
import { ClientActions, EmitResponse, StartGameData } from 'src/shared/socket';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;
  rules: Rules;

  // Access static stuff in template
  Object = Object;

  constructor() {
    this.defaultRules = getDefaultRules();
  }

  ngOnInit(): void {
    if (this.room.gameState.rules) {
      this.rules = this.room.gameState.rules;
    } else {
      this.resetRules();
    }
  }

  startGame() {
    this.room.socket.emit(ClientActions.startGame, <StartGameData>{ rules: this.rules }, (resp: EmitResponse) => {
      if (!resp.success) {
        alert(resp.message);
      }
    });
  }

  resetRules(): void {
    this.rules = Object.keys(this.defaultRules).reduce((o, k) => { o[k] = this.defaultRules[k]; return o; }, <Rules>{});
  }

  getInputType(key: string) {
    switch (typeof this.defaultRules[key]) {
      case "number": return "number";
      case "boolean": return "checkbox";
      default: return "text";
    }
  }

  private defaultRules: Rules;
}
