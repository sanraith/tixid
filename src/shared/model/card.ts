export class CardSet {
    cards: Card[] = [];
    constructor(public id: string, public name: string) { }
}

export class Card {
    public id: string;
    public path: string;

    constructor(id: string, path?: string) {
        this.id = id;
        this.path = path ?? id;
    }
}
