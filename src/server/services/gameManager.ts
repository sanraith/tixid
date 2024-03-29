import { GameStep } from '../../shared/model/gameStep';
import Room from '../models/room';
import { Card, CardSet } from '../../shared/model/card';
import GameState, { PlayerGameData, RoundPointReason } from '../models/gameState';
import shuffle from 'shuffle-array';
import { Rules } from '../../shared/model/rules';
import socketManager from './socketManager';
import Debug from 'debug';
import UserInfo from '../models/userInfo';
import { assertNever } from "assert-never";
const debug = Debug('tixid:services:gameManager');

interface TransitionResult {
    success: boolean,
    message?: string;
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
        if (!this.state.rules.invalidStateChanges &&
            this.state.step !== GameStep.dealCards) {
            return this.errorResult("Can only start the round after the deal cards step!");
        }

        // If somebody has enough points, show the final results instead.
        if (this.state.players.some(x => x.points >= this.state.rules.pointsToWin)) {
            this.state.step = GameStep.finalResults;
            this.resetPlayerReadiness();
            socketManager.emitPlayerStateChanged(this.room, this.room.state.players);
            socketManager.emitGameStateChanged(this.room);

            return this.successResult();
        }

        // Reset piles
        this.state.storyCardPile.forEach(sc => this.state.discardPile.push(sc.card));
        this.state.storyCardPile = [];
        this.state.votes = [];
        this.state.roundPoints = [];
        this.state.storyCard = undefined;
        this.state.story = undefined;

        // Draw until everyone has the right amount of cards
        const handSize = this.state.rules.handSize;
        Object.values(this.state.players)
            .filter(p => p.hand.length < handSize)
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
        socketManager.emitPlayerStateChanged(this.room, this.state.players);
        socketManager.emitGameStateChanged(this.room);

        return this.successResult();
    }

    extendStory(userInfo: UserInfo, cards: Card[]): TransitionResult {
        const player = this.state.players.find(x => x.userInfo.id === userInfo.id);
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.extendStory) {
            return this.errorResult("Can only extend story in the extend story step!");
        }
        if (!player) { return this.errorResult("Cannot find user!"); }
        if (!cards || cards.length === 0) { return this.errorResult("No cards provided!"); }
        if (cards.length > this.state.rules.maxExtendCardCount) { return this.errorResult("Too many cards used in extend story step!"); }
        if (!cards.every(card => player.hasCard(card))) { return this.errorResult("Card is not in the player's hand!"); }
        if (player.isReady) { return this.errorResult("Cannot extend the story more than once!"); }

        // Add story card to story card pile
        for (let card of cards) {
            player.removeCard(card);
            this.state.storyCardPile.push({ userInfo: userInfo, card: card });
        }
        player.isReady = true;

        if (this.areAllPlayersReady()) {
            shuffle(this.state.storyCardPile);
            this.state.step = GameStep.voteStory;
            this.resetPlayerReadiness();
            this.state.storyTeller!.isReady = true;
            socketManager.emitPlayerStateChanged(this.room, this.state.players);
        } else {
            socketManager.emitPlayerStateChanged(this.room, [player]);
        }
        socketManager.emitGameStateChanged(this.room);

        return this.successResult();
    }

    voteStory(userInfo: UserInfo, cards: Card[]): TransitionResult {
        const player = this.state.players.find(x => x.userInfo.id === userInfo.id);
        if (!this.state.rules.invalidStateChanges && this.state.step !== GameStep.voteStory) {
            return this.errorResult("Can only vote in the vote story step!");
        }
        if (!player) { return this.errorResult("Cannot find user!"); }
        if (!cards || cards.length === 0) { return this.errorResult("No cards provided!"); }
        if (cards.length > this.state.rules.maxVoteCount) { return this.errorResult("Voted for too many cards!"); }
        if (!cards.every(card => this.state.storyCardPile.find(sc => sc.card === card))) { return this.errorResult("Voted card is not in the story card pile!"); }
        if (player.isReady) { return this.errorResult("Cannot vote more than once!"); }

        // Register votes
        this.state.votes.push({ userInfo: userInfo, cards: cards });
        player.isReady = true;

        if (this.areAllPlayersReady()) {
            this.scoreVotes();
            this.state.step = GameStep.voteStoryResults;
            this.resetPlayerReadiness();
            socketManager.emitPlayerStateChanged(this.room, this.state.players);
        } else {
            socketManager.emitPlayerStateChanged(this.room, [player]);
        }
        socketManager.emitGameStateChanged(this.room);

        return this.successResult();
    }

    goToLobby(): TransitionResult {
        const state = this.state;
        if (!state.rules.invalidStateChanges && state.step !== GameStep.finalResults) {
            return this.errorResult("Can only go to the lobby after the final results step!");
        }

        this.state.step = GameStep.lobby;
        this.resetPlayerReadiness();
        socketManager.emitGameStateChanged(this.room);

        return this.successResult();
    }

    indicatePlayerReady(userInfo: UserInfo): TransitionResult {
        const state = this.state;
        const player = state.players.find(x => x.userInfo === userInfo);
        if (!player) { return this.errorResult("User is not participating in the current game!"); }
        if (player.isReady) { return this.errorResult("Player already indicated readiness!"); }
        switch (state.step) {
            case GameStep.lobby:
            case GameStep.voteStoryResults:
            case GameStep.finalResults:
                break;
            default:
                return this.errorResult("You cannot indicate readiness because you have pending actions!");
        }

        player.isReady = true;
        socketManager.emitPlayerStateChanged(this.room, [player]);

        // Advance game if all players are ready
        if (this.areAllPlayersReady()) {
            switch (state.step) {
                case GameStep.lobby:
                    // Do nothing, as the owner explicitly have to start the game
                    break;
                case GameStep.voteStoryResults:
                    return this.startRound();
                case GameStep.finalResults:
                    return this.goToLobby();
                default:
                    assertNever(state.step);
            }
        }

        return this.successResult();
    }

    kickPlayer(kickedUserInfo: UserInfo): TransitionResult {
        const state = this.state;
        const kickedPlayerStateIndex = state.players.findIndex(x => x.userInfo === kickedUserInfo);
        if (kickedPlayerStateIndex >= 0) {
            // Change the story teller to the previous player if the kicked player is the story teller.
            // Doing so will correctly advance the storyteller to the next available player.
            if (state.storyTeller?.userInfo === kickedUserInfo) {
                state.storyTeller = state.players[(kickedPlayerStateIndex + state.players.length - 1) % state.players.length];
            }

            // Remove the kicked player from the list of players.
            state.players.splice(kickedPlayerStateIndex, 1);
            socketManager.emitPlayerStateChanged(this.room, state.players, undefined, true);
        }
        socketManager.emitKickedFromRoom(this.room, kickedUserInfo, "Game owner kicked you from the room.");

        if (state.step !== GameStep.lobby) {
            // Start a new round with the remaining players.
            return this.startRound();
        } else {
            return { success: true };
        }
    }

    private scoreVotes() {
        const state = this.state;
        const points = state.roundPoints;
        const storyTeller = state.storyTeller!;
        const storyCard = state.storyCard!;

        let isEverybodyGuessed = true;
        let isNobodyGuessed = true;
        for (let vote of state.votes) {
            const guessed = vote.cards.includes(storyCard);
            isEverybodyGuessed = isEverybodyGuessed && guessed;
            isNobodyGuessed = isNobodyGuessed && !guessed;
        }

        if (isEverybodyGuessed || isNobodyGuessed) {
            // Add points to everyone except storyteller if everyone or no one guessed right
            const rewardReason = isEverybodyGuessed ? RoundPointReason.everybodyGuessedRight : RoundPointReason.nobodyGuessedRight;
            const rewardedPoints = state.rules.pointsNobodyOrEverybodyGuessedRight;
            state.players
                .filter(x => x.userInfo !== storyTeller.userInfo)
                .forEach(x => points.push({ points: rewardedPoints, reason: rewardReason, userInfo: x.userInfo }));
        } else {
            // Add points to the storyteller and everyone who guessed right
            const rewardedPoints = state.rules.pointsSomebodyGuessedRight;
            const rewardedPointsForMultiVote = state.rules.pointsSomebodyGuessedRightUsingMultipleVotes;
            points.push({
                userInfo: storyTeller.userInfo,
                points: rewardedPoints,
                reason: RoundPointReason.somebodyGuessedRight
            });
            this.state.votes
                .filter(vote => vote.cards.includes(storyCard))
                .forEach(vote => points.push({
                    userInfo: vote.userInfo,
                    points: vote.cards.length == 1 ? rewardedPoints : rewardedPointsForMultiVote,
                    reason: vote.cards.length == 1
                        ? (state.rules.maxVoteCount > 1 ? RoundPointReason.guessedRightWithOneVote : RoundPointReason.guessedRight)
                        : RoundPointReason.guessedRightWithMultiVotes
                }));
        }

        // Add points to players who deceived somebody.
        const maxDeceivePoints = state.rules.maxPointsDeceivedSomebody;
        const normalDeceivePoints = state.rules.pointsDeceivedSomebody;
        const userDeceivePoints = state.players.reduce((dict, p) => { dict[p.userInfo.id] = 0; return dict; }, <Record<string, number>>{});
        for (let vote of state.votes) {
            for (let votedCard of vote.cards.filter(x => x !== state.storyCard)) {
                const receivingUser = state.storyCardPile.find(sc => sc.card === votedCard)!.userInfo;
                const currentPoints = userDeceivePoints[receivingUser.id];
                const alreadyAtMaximum = normalDeceivePoints + currentPoints > maxDeceivePoints;
                const receivedPoints = alreadyAtMaximum ? 0 : normalDeceivePoints;
                points.push({
                    points: receivedPoints,
                    reason: alreadyAtMaximum ? RoundPointReason.deceivedSomebodyOverMaximum : RoundPointReason.deceivedSomebody,
                    userInfo: receivingUser
                });
                userDeceivePoints[receivingUser.id] += receivedPoints;
            }
        }
        points.sort((a, b) => a.userInfo.name.localeCompare(b.userInfo.name));

        // Apply points to players
        for (const pointData of points) {
            const player = state.players.find(x => x.userInfo === pointData.userInfo)!;
            player.points += pointData.points;
        }
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
