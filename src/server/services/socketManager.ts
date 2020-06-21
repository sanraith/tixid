import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import roomManager from './roomManager';
import userManager, { UserCookies } from './userManager';
import UserInfo from '../models/userInfo';
import { ClientActions, JoinRoomData, ClientEvents } from '../../shared/socket';
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
            const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(socket.handshake.headers.cookie);
            const userInfo = userManager.getUserFromCookies(userCookies);
            debug(`Client ${userInfo.name} connected: ${socket.client.id}`);

            socket.on(SocketEvents.disconnect, () => {
                // Leave all rooms
                roomManager.getRooms()
                    .filter(x => x.players.some(p => userInfo.id === p.id))
                    .forEach(x => roomManager.leaveRoom(x, userInfo));

                debug(`Client ${userInfo.name} disconnected: ${socket.client.id}`);
            })

            socket.on(ClientActions.joinRoom, (data: JoinRoomData) => {
                debug(`Client ${userInfo.name} joins room`, data);
                
                const room = roomManager.getRoom(data.roomId);
                if (room) {
                    socket.join(this.getRoomChannelId(room.id));
                    roomManager.joinRoom(room, userInfo);
                }
            });
        });

        this.io = io;
        this.notifyOnInitListeners();
    }

    emitPlayersChanged(roomId: string, players: UserInfo[]) {
        this.io.to(this.getRoomChannelId(roomId))
            .emit(ClientEvents.playersChanged, players);
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }

    onInit(onInitFn: () => void) {
        this.onInitListeners.push(onInitFn);
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
