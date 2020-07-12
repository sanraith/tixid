import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from 'src/shared/model/card';

@Component({
  selector: 'app-card-picker',
  templateUrl: './card-picker.component.html',
  styleUrls: ['./card-picker.component.sass']
})
export class CardPickerComponent implements OnInit ,OnChanges{
  @Input()
  cards: string[];

  @Input()
  selectedCard: string;

  @Output()
  selectedCardChange = new EventEmitter();

  constructor() { }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnInit(): void {
    console.log("card picket init");
  }
  
  _selectedCardChange() {
    console.log(this.selectedCard);
    this.selectedCardChange.emit(this.selectedCard);
  }
}
