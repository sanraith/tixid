import { Component, OnInit, ViewChild, ComponentFactoryResolver, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse, PlayerStateChangedData, GameStateChangedData, KickPlayerData, KickedFromRoomData, JoinRoomResponse } from 'src/shared/socket';
import { RoomContentDirective } from './roomContentDirective';
import { LobbyComponent } from './lobby/lobby.component';
import RoomContentComponent from './roomContentComponent';
import RoomModel from '../models/roomModel';
import { UserService } from '../services/user.service';
import { PrivatePlayerState } from 'src/shared/model/sharedPlayerState';
import { MakeStoryComponent } from './make-story/make-story.component';
import { GameStep } from 'src/shared/model/gameStep';
import { ExtendStoryComponent } from './extend-story/extend-story.component';
import { VoteStoryComponent } from './vote-story/vote-story.component';
import { VoteStoryResultsComponent } from './vote-story-results/vote-story-results.component';
import { PublicUserInfo } from 'src/shared/model/publicUserInfo';
import { FinalResultsComponent } from './final-results/final-results.component';
import { PreJoinComponent } from './pre-join/pre-join.component';
import { AudioService, SoundEffect } from '../services/audio.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {
    room: RoomModel = new RoomModel();
    isOwner: boolean;

    @ViewChild(RoomContentDirective, { static: true })
    contentHost: RoomContentDirective;

    // Capture types to use in template
    types = {
        GameStep: GameStep
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private roomSocket: Socket,
        private componentFactoryResolver: ComponentFactoryResolver,
        private userService: UserService,
        private audioService: AudioService
    ) {
        this.room.socket = roomSocket;
    }

    ngOnInit(): void {
        this.room.currentUser = this.userService.userData;
        this.room.id = this.route.snapshot.paramMap.get('id')!;

        if (!this.room.currentUser.isNamePersonalized) {
            this.loadContent(PreJoinComponent);
        } else {
            this.join();
        }
    }

    ngOnDestroy(): void {
        this.leave();
    }

    takeOwnership() {
        if (confirm("Are you sure you want to take ownership of the room?")) {
            this.emitAction(ClientActions.takeOwnership);
        }
    }

    kick(player: PublicUserInfo) {
        if (confirm(`Are you sure you want to kick ${player.name} from the room?`)) {
            this.emitAction(ClientActions.kickPlayer, <KickPlayerData>{ publicId: player.id });
        }
    }

    lobby() { this.emitAction(ClientActions.goToLobby); }
    startGame() { this.emitAction(ClientActions.startGame); }
    startRound() { this.emitAction(ClientActions.startRound); }

    private emitAction(action: ClientActions, data?: any) {
        this.roomSocket.emit(action, data, (resp: EmitResponse) => {
            if (!resp.success) {
                alert(resp.message);
            }
        });
    }

    private async join(): Promise<void> {
        this.roomSocket.on(ClientEvents.gameStarted, () => {
            console.log(`Event: ${ClientEvents.gameStarted}`);
            this.room.playerStates = [];
        });

        this.roomSocket.on(ClientEvents.playersChanged, (args: PlayersChangedData) => {
            console.log(`Event: ${ClientEvents.playersChanged} ${JSON.stringify(args)}`);

            // If a new player have joined or left in the lobby, play a sound
            if (this.room.gameState?.step === GameStep.lobby) {
                if (args.players.length > this.room.players.length) {
                    this.audioService.play(SoundEffect.PlayerJoined);
                } else if (args.players.length < this.room.players.length) {
                    this.audioService.play(SoundEffect.PlayerLeft);
                }
            }

            this.room.owner = args.owner;
            this.room.players = args.players;
            this.isOwner = this.room.currentUser.id === this.room.owner.id;
        });

        this.roomSocket.on(ClientEvents.playerStateChanged, (args: PlayerStateChangedData) => {
            console.log(`Event: ${ClientEvents.playerStateChanged} ${JSON.stringify(args)}`);

            const myNewState = <PrivatePlayerState>args.playerStates.find(x => x.userInfo.id === this.room.currentUser.id);
            this.room.myState = myNewState ? myNewState : this.room.myState;

            if (args.isCompleteList) { this.room.playerStates = []; }
            const pStates = this.room.playerStates;
            for (const playerState of args.playerStates) {
                const localPlayerStateIndex = pStates.findIndex(x => x.userInfo.id === playerState.userInfo.id);
                if (localPlayerStateIndex >= 0) {
                    pStates[localPlayerStateIndex] = playerState;
                } else {
                    pStates.push(playerState);
                }
            }
            this.updateLocalState();
        });

        this.roomSocket.on(ClientEvents.gameStateChanged, (newState: GameStateChangedData) => {
            console.log(`Event: ${ClientEvents.gameStateChanged} ${JSON.stringify(newState)}`);
            const currentGameState = this.room.gameState;

            const newContent = this.pickRoomContent(currentGameState?.step, newState.step);
            this.room.gameState = newState;
            this.updateLocalState();

            // If new cards are added to the story card pile, play a sound
            const cardPileDifference = (newState.storyCardPile?.length ?? 0) - (currentGameState?.storyCardPile?.length ?? 0);
            if (cardPileDifference > 0) {
                this.audioService.play(SoundEffect.PlaceCard);
            }

            // Play right/wrong sound imn the voteStoryResults step.
            if (currentGameState?.step !== GameStep.voteStoryResults && newState?.step === GameStep.voteStoryResults) {
                if (this.room.currentUser.id === newState?.storyTeller.id || newState.storyCardId === this.room.localState.myVotedCardId) {
                    this.audioService.play(SoundEffect.GuessedRight);
                } else {
                    this.audioService.play(SoundEffect.GuessedWrong);
                }
            }

            if (newContent) {
                this.loadContent(newContent);
            }
        });

        this.roomSocket.on(ClientEvents.connect, () => {
            console.log("Socket connected.");
            this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: this.room.id }, (resp: JoinRoomResponse) => {
                if (resp.success) {
                    this.room.name = resp.name;
                } else {
                    console.log("Failed to join room, redirecting to home.");
                    this.router.navigate(['home']);
                }
            });
        });

        this.roomSocket.on(ClientEvents.disconnect, () => {
            console.log("Socket disconnected.");
        });

        this.roomSocket.on(ClientEvents.kickedFromRoom, (args: KickedFromRoomData) => {
            console.log(`Kicked from room. ${args.roomId}`);
            if (this.room.id === args.roomId) {
                alert(`You have been kicked from the room. Reason: ${args.reason}`);
                this.router.navigate(['home']);
            }
        });

        this.roomSocket.connect();
    }

    private updateLocalState(): void {
        const gameState = this.room.gameState;
        const localState = this.room.localState;

        if (gameState.storyCardPile) {
            const mySubmittedCardIds = gameState.storyCardPile.filter(x => x.userInfo?.id === this.room.currentUser.id).map(x => x.cardId);
            localState.mySubmittedCardIds = mySubmittedCardIds;
            localState.voteCardIds = gameState.storyCardPile.map(x => x.cardId);
        }

        if (gameState.votes) {
            const myVotedCardId = gameState.votes.find(x => x.userInfo?.id === this.room.currentUser.id)?.cardId;
            localState.myVotedCardId = myVotedCardId;
            localState.votesByCardId = gameState.votes.reduce((votes, v) => {
                if (!votes[v.cardId]) { votes[v.cardId] = []; }
                votes[v.cardId].push(v.userInfo);
                return votes;
            }, <Record<string, PublicUserInfo[]>>{})
        }

        if (gameState.votePoints) {
            localState.orderedPlayerResults = this.room.playerStates
                .map(p => ({
                    userInfo: p.userInfo,
                    totalPoints: p.points,
                    newPoints: gameState.votePoints
                        .filter(x => x.userInfo.id === p.userInfo.id)
                        .reduce((points, vote) => points + vote.points, 0)
                }))
                .sort((a, b) => b.totalPoints - a.totalPoints);
        }
    }

    private leave(): void {
        console.log("Leaving...");
        this.roomSocket.emit(ClientActions.leaveRooms, null, (resp: EmitResponse) => { });
        this.roomSocket.removeAllListeners();
        this.roomSocket.disconnect();
    }

    private loadContent(component: Type<RoomContentComponent>) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const viewContainerRef = this.contentHost.viewContainerRef;
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent(componentFactory);
        componentRef.instance.room = this.room;
    }

    private pickRoomContent(previousStep: GameStep | undefined, newStep: GameStep): Type<RoomContentComponent> | null {
        if (previousStep === newStep) {
            return null;
        }

        // If the game step have changed, play a sound
        switch (newStep) {
            case GameStep.voteStoryResults: break; // play success or fail sound in game state change
            case GameStep.finalResults: this.audioService.play(SoundEffect.GameEndTone); break;
            default: this.audioService.play(SoundEffect.StepChange);
        }

        switch (newStep) {
            case GameStep.lobby: return LobbyComponent;
            case GameStep.makeStory: return MakeStoryComponent;
            case GameStep.extendStory: return ExtendStoryComponent;
            case GameStep.voteStory: return VoteStoryComponent;
            case GameStep.voteStoryResults: return VoteStoryResultsComponent;
            case GameStep.finalResults: return FinalResultsComponent;
            default: return null;
        }
    }
}
