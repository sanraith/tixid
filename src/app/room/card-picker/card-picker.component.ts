import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card } from 'src/shared/model/card';

@Component({
  selector: 'app-card-picker',
  templateUrl: './card-picker.component.html',
  styleUrls: ['./card-picker.component.sass']
})
export class CardPickerComponent implements OnInit {
  @Input()
  cards: Card[];

  @Input()
  selectedCard: Card;

  @Output()
  selectedCardChange = new EventEmitter();

  constructor() { }
  ngOnInit(): void { }
}
