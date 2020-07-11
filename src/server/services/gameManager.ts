import { GameStep } from '../../shared/model/gameStep';
import Room from '../models/room';
import { Card, CardSet } from '../../shared/model/card';
import GameState, { PlayerGameData } from '../models/gameState';
import shuffle from 'shuffle-array';
import { Rules } from '../models/rules';
import socketManager from './socketManager';
import Debug from 'debug';
import UserInfo from '../models/userInfo';
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

        // Reset piles
        this.state.storyCardPile.forEach(sc => this.state.discardPile.push(sc.card));
        this.state.storyCardPile = [];
        this.state.votes = [];

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

        this.resetPlayerReadiness(true);
        this.state.storyTeller.isReady = false;

        this.state.step = GameStep.makeStory;
        socketManager.emitGameStateChanged(this.room);
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
        if (!card) { return this.errorResult("Card is empty!"); }
        if (!storyTeller.hasCard(card)) { return this.errorResult("Card is not in the storyteller's hand!"); }

        this.state.story = story;
        this.state.storyCard = storyTeller.removeCard(card);
        this.state.storyCardPile.push({ userInfo: storyTeller.userInfo, card: this.state.storyCard });

        this.resetPlayerReadiness();
        storyTeller.isReady = true;

        this.state.step = GameStep.extendStory;
        socketManager.emitPlayerStateChanged(this.room, [storyTeller]);
        socketManager.emitGameStateChanged(this.room);

        return this.successResult();
    }

    extendStory(userInfo: UserInfo, card: Card): TransitionResult {
        const player = this.state.players.find(x => x.userInfo.id === userInfo.id);
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.extendStory) {
            return this.errorResult("Can only extend story in the extend story step!");
        }
        if (!player) { return this.errorResult("Cannot find user!"); }
        if (!card) { return this.errorResult("Card is empty!"); }
        if (!player.hasCard(card)) { return this.errorResult("Card is not in the player's hand!"); }
        if (player.isReady) { return this.errorResult("Cannot extend the story more than once!"); }

        // Add story card to story card pile
        player.removeCard(card);
        this.state.storyCardPile.push({ userInfo: userInfo, card: card });
        player.isReady = true;

        if (this.areAllPlayersReady()) {
            this.state.step = GameStep.voteStory;
            this.resetPlayerReadiness();
        }
        socketManager.emitPlayerStateChanged(this.room, [player]);
        socketManager.emitGameStateChanged(this.room); // TODO remove? Maybe required to re-render common pile...

        return this.successResult();
    }

    voteStory(userInfo: UserInfo, card: Card): TransitionResult {
        const player = this.state.players.find(x => x.userInfo.id === userInfo.id);
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.voteStory) {
            return this.errorResult("Can only vote in the vote story step!");
        }
        if (!player) { return this.errorResult("Cannot find user!"); }
        if (!card) { return this.errorResult("Card is empty!"); }
        if (!this.state.storyCardPile.find(sc => sc.card === card)) { return this.errorResult("Card is not in the story card pile!"); }
        if (player.isReady) { return this.errorResult("Cannot vote more than once!"); }

        // Register vote
        this.state.votes.push({ userInfo: userInfo, card: card });
        player.isReady = true;

        if (this.areAllPlayersReady()) {
            this.state.step = GameStep.voteStoryResults;
            this.resetPlayerReadiness();
        }
        socketManager.emitPlayerStateChanged(this.room, [player]);
        socketManager.emitGameStateChanged(this.room); // TODO remove? Maybe required to re-render common pile...

        return this.successResult();
    }

    private areAllPlayersReady(): boolean {
        for (const player of this.state.players) {
            if (!player.isReady) {
                return false;
            }
        }
        return true;
    }

    private resetPlayerReadiness(isReady: boolean = false): void {
        for (const player of this.state.players) {
            player.isReady = isReady;
        }
    }

    private errorResult(message: string): TransitionResult { return { success: false, message: message }; }
    private successResult(): TransitionResult { return { success: true }; }
}