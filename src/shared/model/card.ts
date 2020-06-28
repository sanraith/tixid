export class CardSet {
    cards: Card[] = [];
    constructor(public id: string, public name: string) { }
}

export class Card {
    constructor(public id: string, public path: string) { }
}
