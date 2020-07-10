import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardSet, Card } from 'src/shared/model/card';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  cards: Record<string, Card>;

  constructor(private http: HttpClient) { }

  async init(): Promise<void> {
    if (!this.cards) {
      const data = await this.http.get('cards.json', { responseType: 'text' }).toPromise();
      this.cards = (<{ sets: CardSet[]; }>JSON.parse(data)).sets
        .reduce((cards, set) => { cards.push.apply(cards, set.cards); return cards; }, <Card[]>[])
        .map((card: Card) => { card.path = `assets/cardSets/${card.path}`; return card; })
        .reduce((dict, card) => { dict[card.id] = card; return dict; }, {});
      console.log(this.cards);
    }
  }
}
