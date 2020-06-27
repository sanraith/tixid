import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import roomManager from './roomManager';
import userManager, { UserCookies } from './userManager';
import UserInfo from '../models/userInfo';
import { ClientActions, JoinRoomData, ClientEvents, PlayersChangedData, EmitResponse } from '../../shared/socket';
import Room from '../models/room';
const debug = Debug('tixid:services:socketManager');

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
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
            debug(`Client ${userInfo.name} connected: ${socket.client.id}`);

            socket.on(SocketEvents.disconnect, () => {
                // Leave all rooms
                roomManager.getRooms()
                    .filter(x => x.players.some(p => userInfo.id === p.id))
                    .forEach(x => roomManager.leaveRoom(x, userInfo));

                debug(`Client ${userInfo.name} disconnected: ${socket.client.id}`);
            })

            socket.on(ClientActions.joinRoom, (data: JoinRoomData, callback: (resp: EmitResponse) => void) => {
                debug(`Client ${userInfo.name} joins room`, data);

                const room = roomManager.getRoom(data.roomId);
                if (room) {
                    socket.join(this.getRoomChannelId(room.id));
                    roomManager.joinRoom(room, userInfo);
                    callback({ success: true });
                } else {
                    callback({ success: false });
                }
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
