import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Rules, getDefaultRules, } from 'src/shared/model/rules';
import { ClientActions, EmitResponse, StartGameData } from 'src/shared/socket';
import { CardSetInfo, GetCardSetsResponse } from 'src/shared/responses';
import { HttpClient } from '@angular/common/http';
import { GET_CARDSETS_PATH } from 'src/shared/apiPaths';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements RoomContentComponent, OnInit {
  @Input()
  room: RoomModel;
  roomAddress: string;
  rules: Rules;
  sets: {
    info: CardSetInfo,
    isSelected: boolean;
  }[];

  // Access static stuff in template
  Object = Object;

  constructor(private http: HttpClient) {
    this.defaultRules = getDefaultRules();
    this.roomAddress = window.location.href;
  }

  ngOnInit(): void {
    if (this.room.gameState.rules) {
      this.rules = this.room.gameState.rules;
    } else {
      this.resetRules();
    }
    this.loadAvailableCardSets();
  }

  startGame() {
    this.rules.cardSets = this.sets.filter(x => x.isSelected).map(x => x.info.id);
    this.room.socket.emit(ClientActions.startGame, <StartGameData>{ rules: this.rules }, (resp: EmitResponse) => {
      if (!resp.success) {
        alert(resp.message);
      }
    });
  }

  resetRules(): void {
    this.rules = Object.keys(this.defaultRules).reduce((o, k) => { o[k] = this.defaultRules[k]; return o; }, <Rules>{});
    this.sets.forEach(x => x.isSelected = true);
  }

  loadAvailableCardSets(): void {
    this.http.get<GetCardSetsResponse>(GET_CARDSETS_PATH)
      .subscribe(result => {
        this.sets = result.cardSets.map(s => ({ info: s, isSelected: true }));
        if (this.rules.cardSets.length > 0) {
          this.rules.cardSets.forEach(s1 => this.sets.find(s2 => s2.info.id === s1)!.isSelected = true);
        }
      });
  }

  async copyRoomAddressToClipboard(input: HTMLInputElement, button: HTMLButtonElement) {
    input.select();
    document.execCommand('copy');

    const previousButtonText = button.innerHTML;
    button.innerHTML = "Copied!";
    setTimeout(() => {
      button.innerHTML = previousButtonText;
    }, 2000);
  }

  getInputType(key: string) {
    switch (typeof this.defaultRules[key]) {
      case "number": return "number";
      case "boolean": return "checkbox";
      case "object": return "object";
      default: return "text";
    }
  }

  private defaultRules: Rules;
}
