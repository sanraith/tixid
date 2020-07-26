import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card-picker',
  templateUrl: './card-picker.component.html',
  styleUrls: ['./card-picker.component.sass']
})
export class CardPickerComponent implements OnInit {
  @Input() cards: string[];
  @Input() selectedCard: string;
  @Input() isEnabled: boolean = true;
  @Input() isOverlayIconEnabled: boolean = true;
  @Input() blockedCards: string[] = [];
  @Input() imageHeightVh: number = 20;
  @Output() selectedCardChange = new EventEmitter();

  displayedCard: string;

  constructor() { }

  ngOnInit(): void {
  }

  _selectedCardChange(): void {
    this.selectedCardChange.emit(this.selectedCard);
  }

  selectCard(card: string): void {
    if (this.isEnabled && !this.blockedCards.includes(card)) {
      this.selectedCard = card;
      this._selectedCardChange();
    }
  }

  displayCard(card?: string): void {
    this.displayedCard = card;
  }

  changeDisplayedCard(direction: number): void {
    const index = this.cards.indexOf(this.displayedCard);
    if (index === -1) { return; }

    const newIndex = Math.max(0, Math.min(this.cards.length - 1, index + direction));
    this.displayedCard = this.cards[newIndex];
  }

  onWheelEvent(scrollEventArgs: { deltaY: number }) {
    this.changeDisplayedCard(scrollEventArgs.deltaY > 0 ? 1 : -1);
  }
}
