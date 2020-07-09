import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import roomManager from './roomManager';
import userManager, { UserCookies } from './userManager';
import UserInfo from '../models/userInfo';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse } from '../../shared/socket';
import Room from '../models/room';
import { userInfo } from 'os';
import GameManager from './gameManager';
import { defaultRules } from '../models/rules';
import cardManager from './cardManager';
const debug = Debug('tixid:services:socketManager');

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
}

class PlayerSocket {
    userInfo: UserInfo;
    room?: Room;
    socket: SocketIo.Socket;

    constructor(user: UserInfo, socket: SocketIo.Socket) {
        this.userInfo = user;
        this.socket = socket;
    }

    joinRoom(data: JoinRoomData): EmitResponse {
        debug(`Client ${userInfo.name} joins room`, data);
        this.room = roomManager.getRoom(data.roomId);
        if (this.room) {
            this.socket.join(this.getRoomChannelId(this.room.id));
            roomManager.joinRoom(this.room, this.userInfo);
            return { success: true };
        } else {
            return { success: false };
        }
    }

    disconnect() {
        this.socket.disconnect();
        roomManager.getRooms()
            .filter(x => x.players.some(p => this.userInfo.id === p.id))
            .forEach(x => roomManager.leaveRoom(x, this.userInfo));
        debug(`Client ${this.userInfo.name} disconnected: ${this.socket.client.id}`);
    }

    startGame(data: any): EmitResponse {
        if (!this.room) { return { success: false, message: "Cannot start the game while not being in a room!" }; }
        if (this.room.owner !== this.userInfo) { return { success: false, message: "Only the owner of the room can start the game!" }; }

        const manager = new GameManager(this.room);
        debug("Requested deal cards");
        const result = manager.startGame(defaultRules, Object.values(cardManager.sets));
        return result;
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}

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
            debug(`Client ${userInfo.name} connected: ${socket.client.id}`);

            socket.on(SocketEvents.disconnect, () => playerSocket.disconnect());
            socket.on(ClientActions.joinRoom, (data: JoinRoomData, callback: (resp: EmitResponse) => void) => {
                callback(playerSocket.joinRoom(data));
            });
            socket.on(ClientActions.startGame, (data: any, callback: (resp: EmitResponse) => void) => {
                callback(playerSocket.startGame(data));
            });
        });

        this.io = io;
        this.notifyOnInitListeners();
    }

    emitPlayersChanged(room: Room) {
        this.io.to(this.getRoomChannelId(room.id)).emit(ClientEvents.playersChanged, <PlayersChangedData>{
            owner: room.owner.publicInfo,
            players: room.players.map(p => p.publicInfo)
        });
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }

    onInit(onInitFn: () => void) {
        this.onInitListeners.push(onInitFn);
    }

    private getUserFromSocketCookies(cookies: any): UserInfo | undefined {
        if (!cookies) {
            return undefined;
        }

        const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(cookies);

        if (!userManager.isCookiesContainUserInfo(userCookies)) {
            return undefined;
        }

        return userManager.getUserFromCookies(userCookies);
    }

    private notifyOnInitListeners() {
        for (const onInitFn of this.onInitListeners) {
            onInitFn();
        }
        this.onInitListeners = [];
    }

    private io!: Server;
    private onInitListeners: (() => void)[] = [];
}

export default new SocketManager();
