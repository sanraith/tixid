import { GameStep } from '../../shared/model/gameStep';
import Room from '../models/room';
import { Card, CardSet } from '../../shared/model/card';
import GameState, { PlayerGameData } from '../models/gameState';
import shuffle from 'shuffle-array';
import { Rules } from '../models/rules';
import socketManager from './socketManager';
import Debug from 'debug';
const debug = Debug('tixid:services:gameManager');

interface TransitionResult {
    success: boolean,
    message?: string
}

export default class GameManager {
    private state: GameState;

    constructor(public room: Room) {
        this.state = room.state;
    }

    // Transition operations

    startGame(rules: Rules, sets: CardSet[]): TransitionResult {
        if (!rules.invalidStateChanges && this.state.step !== GameStep.lobby) {
            return this.errorResult("Can only start a game from the lobby!");
        }

        this.state.rules = rules;
        this.state.cardPool = shuffle(sets.reduce((r, set) => r.concat(set.cards), <Card[]>[]));
        this.state.players = [];
        this.state.discardPile = [];
        this.state.storyTeller = undefined;

        if (this.state.cardPool.length === 0) {
            return this.errorResult("Can not start the game with no card pool!");
        }

        // Setup player game data in randomized order
        shuffle(this.room.players).forEach(p => this.state.players.push(new PlayerGameData(p)));

        this.state.step = GameStep.dealCards;
        socketManager.emitGameStarted(this.room);

        return this.startRound();
    }

    startRound(): TransitionResult {
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.dealCards) {
            return this.errorResult("Can only start the round after the deal cards step!");
        }

        // Draw until everyone has the right amount of cards
        const handSize = this.state.rules.handSize;
        Object.values(this.state.players)
            .filter(p => p.hand.length < handSize - 1)
            .forEach(p => p.addCards(this.state.drawCards(handSize - p.hand.length)));

        // Update the story teller
        const players = this.state.players;
        if (this.state.storyTeller) {
            this.state.storyTeller = players[(players.indexOf(this.state.storyTeller) + 1) % players.length];
        } else {
            this.state.storyTeller = players[0];
        }

        this.state.step = GameStep.makeStory;
        socketManager.emitPlayerStateChanged(this.room, this.state.players);

        return this.successResult();
    }

    makeStory(story: string, card: Card): TransitionResult {
        const storyTeller = this.state.storyTeller!;
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.makeStory) {
            return this.errorResult("Can only make a story in the make story step!");
        }
        if (story === null || story === undefined || story.match(/^\s*$/) !== null) {
            return this.errorResult("Story is empty!");
        }
        if (!card) {
            return this.errorResult("Card is empty!");
        }
        if (storyTeller.hand.indexOf(card) === -1) {
            return this.errorResult("Card is not in the storyteller's hand!");
        }

        this.state.story = story;
        this.state.storyCard = storyTeller.removeCard(card);
        this.state.step = GameStep.extendStory;

        return this.successResult();
    }

    private errorResult(message: string): TransitionResult { return { success: false, message: message }; }
    private successResult(): TransitionResult { return { success: true }; }
}