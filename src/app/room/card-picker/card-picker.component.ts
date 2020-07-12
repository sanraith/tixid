import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-card-picker',
  templateUrl: './card-picker.component.html',
  styleUrls: ['./card-picker.component.sass']
})
export class CardPickerComponent implements OnInit {
  @Input() cards: string[];
  @Input() selectedCard: string;
  @Input() isEnabled: boolean = true;
  @Output() selectedCardChange = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  _selectedCardChange() {
    console.log(this.selectedCard);
    this.selectedCardChange.emit(this.selectedCard);
  }
}
