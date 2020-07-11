import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import userManager, { UserCookies } from './userManager';
import UserInfo from '../models/userInfo';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse, PlayerStateChangedData, GameStateChangedData, MakeStoryData } from '../../shared/socket';
import Room from '../models/room';
import { PublicPlayerState, PrivatePlayerState } from 'src/shared/model/playerState';
import { PlayerGameData } from '../models/gameState';
import PlayerSocket from './playerSocket';
export const debug = Debug('tixid:services:socketManager');

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
}

/**
 * Handles all player socket connections.
 */
class SocketManager {
    init(httpServer: HttpServer) {
        const io = SocketIo(httpServer);

        io.on(SocketEvents.connection, (socket) => {
            debug(`Client connecting: ${socket.client.id}`);

            const userInfo = this.getUserFromSocketCookies(socket.handshake.headers.cookie);
            if (userInfo === undefined) {
                debug(`Disconnected client, no user data: ${socket.client.id}`)
                socket.disconnect();
                return;
            }
            const playerSocket = new PlayerSocket(userInfo, socket);
            this.playerSockets[userInfo.id] = playerSocket;
            debug(`Client ${userInfo.name} connected: ${socket.client.id}`);

            socket.on(SocketEvents.disconnect, () => {
                playerSocket.disconnect();
                delete this.playerSockets[userInfo.id];
            });
            socket.on(ClientActions.joinRoom, (data: JoinRoomData, callback: (resp: EmitResponse) => void) => {
                callback(playerSocket.joinRoom(data));
            });
            socket.on(ClientActions.startGame, (data: any, callback: (resp: EmitResponse) => void) => {
                callback(playerSocket.startGame(data));
            });
            socket.on(ClientActions.makeStory, (data: MakeStoryData, callback: (resp: EmitResponse) => void) => {
                callback(playerSocket.makeStory(data));
            });
        });

        this.io = io;
        this.notifyOnInitListeners();
    }

    emitPlayersChanged(room: Room) {
        this.getRoomChannel(room.id).emit(ClientEvents.playersChanged, <PlayersChangedData>{
            owner: room.owner.publicInfo,
            players: room.players.map(p => p.publicInfo)
        });
    }

    emitGameStarted(room: Room) {
        this.getRoomChannel(room.id).emit(ClientEvents.gameStarted);
    }

    emitPlayerStateChanged(room: Room, changedPlayers: PlayerGameData[], recipient?: UserInfo) {
        const publicPlayerStates: Record<string, PublicPlayerState> = {};
        debug(`Emit players changed: ${changedPlayers.map(p => p.userInfo.name).join(', ')}`);
        changedPlayers
            .forEach(p => publicPlayerStates[p.userInfo.id] = <PublicPlayerState>{
                userInfo: p.userInfo.publicInfo,
                handSize: p.hand.length,
                points: p.points,
                isReady: p.isReady
            });

        const recipients = recipient ? [recipient] : room.players;
        for (const targetPlayer of recipients) {
            const targetSocket = this.playerSockets[targetPlayer.id];
            if (!targetSocket) { debug(`Cannot reach player ${targetPlayer.name}`); continue; }

            const emittedData = <PlayerStateChangedData>{
                playerStates: changedPlayers.map(p => {
                    const publicState = publicPlayerStates[p.userInfo.id]
                    if (p.userInfo === targetPlayer) {
                        return <PrivatePlayerState>{ ...publicState, hand: p.hand.map(c => c.id) };
                    }
                    return publicState;
                })
            };
            targetSocket.socket.emit(ClientEvents.playerStateChanged, emittedData);
        }
    }

    emitGameStateChanged(room: Room, recipient?: UserInfo) {
        debug(`Emitted game state changed: ${room.id}`);
        const state = room.state;
        const gameStateData: GameStateChangedData = {
            cardPoolCount: state.cardPool.length,
            discardPileCount: state.cardPool.length,
            step: state.step,
            story: state.story,
            storyTeller: state.storyTeller?.userInfo.publicInfo,
            storyCardId: state.storyCard?.id
        };

        if (recipient) {
            const playerSocket = this.playerSockets[recipient.id];
            playerSocket.socket.emit(ClientEvents.gameStateChanged, gameStateData);
        } else {
            const roomChannel = this.getRoomChannel(room.id);
            roomChannel.emit(ClientEvents.gameStateChanged, gameStateData);
        }
    }

    getRoomChannel(roomId: string): SocketIo.Namespace {
        return this.io.to(`room_${roomId}`);
    }

    onInit(onInitFn: () => void) {
        this.onInitListeners.push(onInitFn);
    }

    private getUserFromSocketCookies(cookies: any): UserInfo | undefined {
        if (!cookies) { return undefined; }
        const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(cookies);
        if (!userManager.isCookiesContainUserInfo(userCookies)) { return undefined; }

        return userManager.getUserFromCookies(userCookies);
    }

    private notifyOnInitListeners() {
        for (const onInitFn of this.onInitListeners) {
            onInitFn();
        }
        this.onInitListeners = [];
    }

    private io!: Server;
    private playerSockets: Record<string, PlayerSocket> = {};
    private onInitListeners: (() => void)[] = [];
}

export default new SocketManager();
