import { GameStep } from '../../shared/model/gameStep';
import { Card } from '../../shared/model/card';
import UserInfo from './userInfo';
import { Rules, getDefaultRules, } from '../../shared/model/rules';
import shuffle from 'shuffle-array';

export class PlayerGameData {
    userInfo: UserInfo;
    points: number = 0;
    hand: Card[] = [];
    isReady: boolean = false;
    isConnected: boolean = true;

    constructor(info: UserInfo) {
        this.userInfo = info;
    }

    addCards(cards: Card[]) {
        Array.prototype.push.apply(this.hand, cards);
    }

    removeCard(card: Card) {
        return this.hand.splice(this.hand.indexOf(card), 1)[0];
    }

    hasCard(card: Card): boolean {
        return this.hand.indexOf(card) > -1;
    }
}

export enum RoundPointReason {
    everybodyGuessedRight = "everyone guessing right",
    nobodyGuessedRight = "nobody guessing right",

    guessedRight = "guessing right",
    guessedRightWithMultiVotes = "guessing right with multiple votes",
    somebodyGuessedRight = "somebody guessing their card",

    deceivedSomebody = "deceiving somebody",
    deceivedSomebodyOverMaximum = "deceiving somebody (already earned max points for deceiving)"
}

export default class GameState {
    rules: Rules = getDefaultRules();
    step: GameStep = GameStep.lobby;
    cardPool: Card[] = [];
    discardPile: Card[] = [];
    players: PlayerGameData[] = [];

    storyTeller?: PlayerGameData;
    story?: string;
    storyCard?: Card;
    storyCardPile: { userInfo: UserInfo, card: Card }[] = [];
    votes: { userInfo: UserInfo, cards: Card[] }[] = [];

    roundPoints: {
        userInfo: UserInfo,
        points: number,
        reason: RoundPointReason
    }[] = [];

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
