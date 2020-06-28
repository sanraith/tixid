import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Card, CardSet } from 'src/shared/model/card';

@Component({
  selector: 'app-cards-display',
  templateUrl: './cards-display.component.html',
  styleUrls: ['./cards-display.component.sass']
})
export class CardsDisplayComponent implements RoomContentComponent, OnInit {
  room: RoomModel;
  cards: Card[];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getCards();
  }

  private getCards() {
    this.http.get('cards.json', { responseType: 'text' })
      .subscribe(data => {
        this.cards = (<{ sets: CardSet[]; }>JSON.parse(data)).sets
          .reduce((cards, set) => { cards.push.apply(cards, set.cards); return cards; }, <Card[]>[])
          .map((card: Card) => { card.path = `assets/cardSets/${card.path}`; return card; })
          .filter((_, i: number) => i < 10);
      });
  }
}
