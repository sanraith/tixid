import { GameStep } from '../../shared/model/gameStep';
import Room from '../models/room';
import { Card, CardSet } from '../../shared/model/card';
import UserInfo from '../models/userInfo';
import GameState from '../models/gameState';
import shuffle from 'shuffle-array';

interface RoundState1 {
    storyTeller: UserInfo
}

interface RoundState2 extends RoundState1 {
    story: string,
    storyCard: Card
}

interface RoundState3 extends RoundState2 {
    playerPicks: Record<string, UserInfo> // identifier is card id
}

interface RoundState4 extends RoundState3 {
    playerVotes: Record<string, Card> // identifier is user id
    points: Record<string, number> // identifier is user id
}


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

    startGame(sets: CardSet[]): TransitionResult {
        if (this.state.step !== GameStep.lobby) {
            return this.errorResult("Can only start a game from the lobby!");
        }

        this.state.cardPool = shuffle(sets.reduce((r, set) => r.concat(set.cards), <Card[]>[]));
        this.state.players = {};
        this.state.discardPile = [];

        if (this.state.cardPool.length === 0) {
            return this.errorResult("Can not start the game with no card pool!");
        }

        return this.successResult();
    }

    startRound(): boolean {
        switch (this.state.step) {
            case GameStep.lobby:
            case GameStep.partialResults:
                this.state.step = GameStep.makeStory;
                return true;
            default:
                return false;
        }
    }

    // TODO validate card pool
    makeStory(story: string, card: Card): boolean {
        return false;
    }

    private errorResult(message: string): TransitionResult { return { success: false, message: message }; }
    private successResult(): TransitionResult { return { success: true }; }
}