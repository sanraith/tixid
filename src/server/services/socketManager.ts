import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import userManager, { UserCookies } from './userManager';
import UserInfo from '../models/userInfo';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse, PlayerStateChangedData, GameStateChangedData, MakeStoryData, ExtendStoryData, VoteStoryData, StartGameData, KickPlayerData, KickedFromRoomData, JoinRoomResponse, ChangeSpectatorStateData } from '../../shared/socket';
import Room from '../models/room';
import { PublicPlayerState, PrivatePlayerState } from 'src/shared/model/sharedPlayerState';
import { PlayerGameData } from '../models/gameState';
import PlayerSocket from './playerSocket';
import { GameStep } from '../../shared/model/gameStep';
import PickedCard from 'src/shared/model/pickedCard';
import roomManager from './roomManager';
import shortid from 'shortid';
const debug = Debug('tixid:services:socketManager');
const socketTableDebug = Debug('tixidv:socketTable');
const errorDebug = Debug('tixid:services:socketManager:ERROR');

type ErrorHandler = (action: () => void) => void;

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
}

/**
 * Handles all player socket connections.
 */
class SocketManager {
    init(httpServer: HttpServer) {
        const io = SocketIo(httpServer, { perMessageDeflate: false });

        io.on(SocketEvents.connection, (socket) => {
            const userInfo = this.getUserFromSocketCookies(socket.handshake.headers.cookie);
            if (userInfo === undefined) {
                debug(`Disconnected client, no user data: ${socket.client.id}`);
                socket.disconnect();
                return;
            }

            // Save player socket
            if (!this.playerSockets[userInfo.id]) { this.playerSockets[userInfo.id] = []; }
            const playerSockets = this.playerSockets[userInfo.id];
            const playerSocket = new PlayerSocket(userInfo, socket);
            playerSockets.push(playerSocket);
            debug(`Client ${userInfo.name} #${playerSockets.length - 1} connected: ${socket.client.id}`);

            const handleErrorAndLog: ErrorHandler = action => {
                this.handlePlayerSocketError(playerSocket, action);
                if (playerSocket.room) {
                    roomManager.interact(playerSocket.room);
                }
                this.logSocketRoomTable();
            };

            socket.on(SocketEvents.disconnect, () => {
                handleErrorAndLog(() => {
                    if (!this.playerSockets[userInfo.id]) {
                        debug(`Disconnecting ${socket.id}, but cannot find any saved sockets for player ${userInfo.name}!`);
                    }

                    const playerSockets = this.playerSockets[userInfo.id];
                    const index = playerSockets.indexOf(playerSocket);
                    if (index < 0) {
                        debug(`Disconnecting ${socket.id}, but cannot find saved socket for player ${userInfo.name}!`);
                    }

                    playerSocket.socket.removeAllListeners();
                    playerSockets.splice(index, 1);
                    debug(`Disconnecting player ${userInfo.name} socket ${socket.client.id}. ${playerSockets.length} connections remain.`);

                    const areThereRemainingSocketsForTheSameRoom = playerSockets.filter(x => x.room === playerSocket.room).length > 0;
                    if (!areThereRemainingSocketsForTheSameRoom) {
                        playerSocket.markPlayerAsDisconnected();
                        playerSocket.leaveRoom();
                        if (this.playerSockets[userInfo.id].length === 0) {
                            delete this.playerSockets[userInfo.id];
                        }
                    }
                });
            });
            socket.on(ClientActions.joinRoom, (data: JoinRoomData, callback?: (resp: JoinRoomResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.joinRoom(data), callback));
            });
            socket.on(ClientActions.leaveRooms, (data: JoinRoomData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.leaveRoom(), callback));
            });
            socket.on(ClientActions.startGame, (data: StartGameData | undefined, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.startGame(data), callback));
            });
            socket.on(ClientActions.makeStory, (data: MakeStoryData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.makeStory(data), callback));
            });
            socket.on(ClientActions.extendStory, (data: ExtendStoryData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.extendStory(data), callback));
            });
            socket.on(ClientActions.voteStory, (data: VoteStoryData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.voteStory(data), callback));
            });
            socket.on(ClientActions.startRound, (data: any, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.startRound(), callback));
            });
            socket.on(ClientActions.goToLobby, (data: any, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.goToLobby(), callback));
            });
            socket.on(ClientActions.indicateReady, (data: any, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.indicateReady(), callback));
            });
            socket.on(ClientActions.forceReady, (data: any, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.forceReady(), callback));
            });
            socket.on(ClientActions.takeOwnership, (data: any, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.takeOwnership(), callback));
            });
            socket.on(ClientActions.kickPlayer, (data: KickPlayerData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.kickPlayer(data), callback));
            });
            socket.on(ClientActions.changeSpectatorState, (data: ChangeSpectatorStateData, callback?: (resp: EmitResponse) => void) => {
                handleErrorAndLog(() => this.callbackMaybe(playerSocket.changeSpectatorState(data), callback));
            });
        });

        this.io = io;
        this.logSocketRoomTable();
    }

    emitPlayersChanged(room: Room) {
        this.getRoomChannel(room.id).emit(ClientEvents.playersChanged, <PlayersChangedData>{
            owner: room.owner.publicInfo,
            players: room.players.map(p => p.publicInfo),
            spectators: room.spectators.map(p => p.publicInfo)
        });
    }

    emitGameStarted(room: Room) {
        this.getRoomChannel(room.id).emit(ClientEvents.gameStarted);
    }

    emitPlayerStateChanged(room: Room, changedPlayers: PlayerGameData[], recipient?: UserInfo, isCompleteList: boolean = false) {
        const publicPlayerStates: Record<string, PublicPlayerState> = {};
        debug(`Emit players changed: ${changedPlayers.map(p => `${p.userInfo.name} (${this.playerSockets[p.userInfo.id]?.length ?? 0})`).join(', ')} to ${recipient?.name ?? 'all'}`);
        changedPlayers
            .forEach(p => publicPlayerStates[p.userInfo.id] = <PublicPlayerState>{
                userInfo: p.userInfo.publicInfo,
                handSize: p.hand.length,
                points: p.points,
                isReady: p.isReady,
                isConnected: p.isConnected
            });

        const recipients = recipient ? [recipient] : [...room.players, ...room.spectators];
        for (const targetPlayer of recipients) {
            const targetSockets = this.getTargetSockets(room, targetPlayer);
            if (!targetSockets?.length) { debug(`Cannot reach player ${targetPlayer.name}`); continue; }

            for (const targetSocket of targetSockets) {
                const emittedData = <PlayerStateChangedData>{
                    playerStates: changedPlayers.map(p => {
                        const publicState = publicPlayerStates[p.userInfo.id];
                        if (p.userInfo === targetPlayer) {
                            return <PrivatePlayerState>{ ...publicState, hand: p.hand.map(c => c.id) };
                        }
                        return publicState;
                    }),
                    isCompleteList: isCompleteList
                };
                targetSocket.socket.emit(ClientEvents.playerStateChanged, emittedData);
            }
        }
    }

    emitGameStateChanged(room: Room, recipient?: UserInfo) {
        debug(`Emitted game state changed: ${room.id} - ${room.state.step}`);
        const state = room.state;
        const gameStateData: GameStateChangedData = {
            rules: state.rules,
            cardPoolCount: state.cardPool.length,
            discardPileCount: state.cardPool.length,
            // storyCardPile => differs by player
            step: state.step,
            story: state.story,
            storyTeller: state.storyTeller?.userInfo.publicInfo,
            // storyCardId => differs by player
            // votes => differs by player
            votePoints: state.roundPoints?.map(vp => ({ userInfo: vp.userInfo.publicInfo, points: vp.points, reason: vp.reason }))
        };

        const canRevealAllCards = state.step >= GameStep.voteStory;
        const canRevealAllCardOwners = state.step >= GameStep.voteStoryResults;
        const canRevealAllVotes = state.step >= GameStep.voteStoryResults;

        const recipients = recipient ? [recipient] : [...room.players, ...room.spectators];
        for (const targetPlayer of recipients) {
            const targetSockets = this.getTargetSockets(room, targetPlayer);
            if (!targetSockets?.length) { debug(`Cannot reach player ${targetPlayer.name}`); continue; }

            for (const targetSocket of targetSockets) {

                // Only show card origin to card owner, or after the voting
                const storyCardPile = state.storyCardPile.map(sc => <PickedCard>{
                    cardId: (canRevealAllCards || sc.userInfo === targetPlayer) ? sc.card.id : undefined,
                    userInfo: (canRevealAllCardOwners || sc.userInfo === targetPlayer) ? sc.userInfo.publicInfo : undefined
                });
                gameStateData.storyCardPile = storyCardPile;

                // Only show story card to story teller
                if (targetPlayer === state.storyTeller?.userInfo || canRevealAllVotes) {
                    gameStateData.storyCardId = state.storyCard?.id;
                }

                const votes = state.votes.map(vote => ({
                    cardIds: (canRevealAllVotes || vote.userInfo === targetPlayer) ? vote.cards.map(x => x.id) : undefined,
                    userInfo: vote.userInfo.publicInfo
                }));
                gameStateData.votes = votes;

                targetSocket.socket.emit(ClientEvents.gameStateChanged, gameStateData);
            }
        }
    }

    emitKickedFromRoom(room: Room, targetPlayer: UserInfo, reason: string) {
        const targetSockets = this.getTargetSockets(room, targetPlayer);
        if (!targetSockets?.length) { debug(`Cannot reach player ${targetPlayer.name}`); return; }

        for (let targetSocket of targetSockets) {
            targetSocket.socket.emit(ClientEvents.kickedFromRoom, <KickedFromRoomData>{
                roomId: room.id,
                reason: reason
            });
            this.disconnectPlayerSocket(targetSocket);
        }
    }

    getRoomChannel(roomId: string): SocketIo.Namespace {
        return this.io.to(`room_${roomId}`);
    }

    _getSocketsForDebug() {
        return this.playerSockets;
    }

    private handlePlayerSocketError(playerSocket: PlayerSocket, action: () => void) {
        try {
            action();
        } catch (error) {
            const errorId = `err_${shortid()}`;
            errorDebug(`${errorId}:`, error);

            if (playerSocket.room) {
                const room = playerSocket.room;
                const roomPlayersAndSpectators = [...playerSocket.room.players, ...playerSocket.room.spectators];
                for (let player of roomPlayersAndSpectators) {
                    this.emitKickedFromRoom(playerSocket.room, player, `Game server error. Id: ${errorId}`);
                }
                roomManager.deleteRoom(playerSocket.room);

                const socketsToDisconnect = roomPlayersAndSpectators
                    .map(x => this.getTargetSockets(room, x))
                    .reduce((a, x) => { a.push(...x); return a; }, []);
                for (let socketToDisconnect of socketsToDisconnect) {
                    this.disconnectPlayerSocket(socketToDisconnect);
                }
            } else {
                this.disconnectPlayerSocket(playerSocket);
            }

            errorDebug(`${errorId} cleanup finished.`);
        }
    }

    private disconnectPlayerSocket(socket: PlayerSocket) {
        socket.markPlayerAsDisconnected();
        socket.socket.disconnect();
        socket.socket.removeAllListeners();

        if (!this.playerSockets[socket.userInfo.id]?.length) {
            delete this.playerSockets[socket.userInfo.id];
        }
    }

    private getUserFromSocketCookies(cookies: any): UserInfo | undefined {
        if (!cookies) { return undefined; }
        const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(cookies);
        if (!userManager.isCookiesContainUserInfo(userCookies)) { return undefined; }

        return userManager.getUserFromCookies(userCookies);
    }

    private getTargetSockets(room: Room, player: UserInfo): PlayerSocket[] {
        const availableSockets = this.playerSockets[player.id];
        if (!availableSockets) {
            debug(`No target socket is found for user ${player.name} - ${player.id}`);
            return [];
        }

        return availableSockets.filter(x => x.room === room);
    }

    private callbackMaybe(value: EmitResponse, callback: ((resp: EmitResponse) => void) | undefined) {
        if (callback) {
            callback(value);
        }
    }

    private logSocketRoomTable() {
        if (!Debug.enabled('tixidv:socketTable') || Object.keys(this.playerSockets).length === 0) { return; }

        const hSeparator = '|';
        const cSeparator = '+';
        const vSeparator = '-';
        const cornerText = 'SCKT\\ROOM';
        const playerNames = Object.keys(this.playerSockets).map(x => userManager.getUserByPrivateId(x).name);
        const playerColumnWidth = [...playerNames, cornerText].reduce((a, x) => x.length > a ? x.length : a, 0);

        let tableText = cornerText.padStart(playerColumnWidth, ' ') + hSeparator +
            roomManager.getRooms().map(x => x.name).join(hSeparator);
        tableText += '\n' + ''.padStart(playerColumnWidth, vSeparator) + cSeparator +
            roomManager.getRooms().map(x => x.name.length).map(x => ''.padStart(x, vSeparator)).join(cSeparator);

        for (let player in this.playerSockets) {
            const roomParts = roomManager.getRooms()
                .map(room => ({ room, isJoined: this.playerSockets[player].filter(ps => ps.room === room).length }))
                .map(x => (x.isJoined ? `${x.isJoined}${x.room.state.players.some(x => x.userInfo.id === player) ? 'P' : 'S'}` : ' ')
                    .padStart(x.room.name.length, ' '))
                .join(hSeparator);
            tableText += '\n' + userManager.getUserByPrivateId(player).name.padStart(playerColumnWidth, ' ') + hSeparator + roomParts;
        }
        socketTableDebug(tableText);
    }

    private io!: Server;
    private playerSockets: Record<string, PlayerSocket[]> = {};
}

export default new SocketManager();
