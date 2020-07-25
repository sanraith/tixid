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

  _selectedCardChange() {
    this.selectedCardChange.emit(this.selectedCard);
  }

  displayCard(card?: string): void {
    this.displayedCard = card;
  }
}
