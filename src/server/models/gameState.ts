import { GameStep } from 'src/shared/model/gameStep';
import { Card } from 'src/shared/model/card';
import UserInfo from './userInfo';
import { Rules } from './rules';
import shuffle from 'shuffle-array';

export class PlayerGameData {
    info: UserInfo;
    points: number = 0;
    hand: Card[] = [];

    constructor(info: UserInfo) {
        this.info = info;
    }

    addCards(cards: Card[]) {
        Array.prototype.push.apply(this.hand, cards);
    }

    removeCard(card: Card) {
        return this.hand.splice(this.hand.indexOf(card), 1)[0];
    }
}

export default class GameState {
    rules: Rules;
    step: GameStep = GameStep.lobby;
    cardPool: Card[] = [];
    discardPile: Card[] = [];
    players: PlayerGameData[];

    storyTeller: PlayerGameData;
    story: string;
    storyCard: Card;

    drawCards(count: number): Card[] {
        if (this.cardPool.length < count) {
            this.shuffleDiscardPileIntoCardPool();
        }

        if (this.cardPool.length < count) {
            throw Error("Not enough cards in cards to draw!");
        }

        return this.cardPool.splice(-count, count);
    }

    private shuffleDiscardPileIntoCardPool() {
        Array.prototype.unshift.apply(this.cardPool, shuffle(this.discardPile));
        this.discardPile.length = 0;
    }
}