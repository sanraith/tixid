import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
    selector: 'app-card-picker',
    templateUrl: './card-picker.component.html',
    styleUrls: ['./card-picker.component.sass']
})
export class CardPickerComponent implements OnInit {
    // Data
    @Input() cards: string[];
    @Input() selectedCard: string;
    @Input() selectedCards: string[] = [];
    @Input() blockedCards: string[] = [];
    @Output() selectedCardChange = new EventEmitter();
    @Output() selectedCardsChange = new EventEmitter();

    // Behavior
    @Input() isEnabled: boolean = true;
    @Input() maxSelectedCardCount: number = 1;
    @Input() isOverlayIconEnabled: boolean = true;

    // Style
    @Input() imageHeightVh: number = 20;

    displayedCard: string;
    loadedCards = new Set<string>();

    ngOnInit(): void {
        if (this.selectedCard) {
            this.selectedCards = [this.selectedCard];
        }
    }

    selectCard(card: string, isSelected: boolean): void {
        // Do not allow changing state of blocked cards or in disabled mode.
        if (!this.isEnabled || this.blockedCards.includes(card)) {
            return;
        }

        // Add or remove card from selected cards.
        if (isSelected) {
            if (!this.selectedCards.includes(card)) {
                this.selectedCards.push(card);
            }
        } else {
            const index = this.selectedCards.indexOf(card);
            if (index === -1) {
                return;
            }
            this.selectedCards.splice(index, 1);
        }

        // Remove oldest selected card if more are selected than the maximum amount.
        if (this.selectedCards.length > this.maxSelectedCardCount) {
            this.selectedCards.splice(0, 1);
        }

        this.fireSelectedCardsChangeEvents();
    }

    fireSelectedCardsChangeEvents(): void {
        if (this.selectedCards.length < 2) {
            this.selectedCard = this.selectedCards[0] ?? null;
        } else {
            this.selectedCard = null;
        }
        this.selectedCardChange.emit(this.selectedCard);
        this.selectedCardsChange.emit(this.selectedCards);
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

    onWheelEvent(scrollEventArgs: { preventDefault: () => void, deltaY: number }) {
        scrollEventArgs.preventDefault();
        this.changeDisplayedCard(scrollEventArgs.deltaY > 0 ? 1 : -1);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyEvent(keyEventArgs: KeyboardEvent): void {
        if (!this.displayedCard) {
            return;
        }

        switch (keyEventArgs.key) {
            case "ArrowLeft":
                keyEventArgs.preventDefault();
                this.changeDisplayedCard(-1);
                break;
            case "ArrowRight":
                keyEventArgs.preventDefault();
                this.changeDisplayedCard(1);
                break;
            case "Escape":
                keyEventArgs.preventDefault();
                this.displayedCard = null;
                break;
            case "Enter":
            case " ":
                keyEventArgs.preventDefault;
                this.selectCard(this.displayedCard, !this.selectedCards.includes(this.displayedCard));
                break;
        }
    }
}
