import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import Debug from 'debug';
import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
const debug = Debug('tixid:services:socketManager');

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
    joinRoom = "join_room",
    playersChanged = "players_changed"
}

class SocketManager {
    init(httpServer: HttpServer) {
        const io = SocketIo(httpServer);

        io.on(SocketEvents.connection, (socket) => {
            debug(`Client connected: ${socket.client.id}`);

            let clientInfo: UserInfo | undefined = undefined;

            socket.on(SocketEvents.disconnect, () => {
                if (!clientInfo) { return; }

                // Leave all rooms
                roomManager.getRooms()
                    .filter(x => x.players.some(p => clientInfo!.idEquals(p)))
                    .forEach(x => roomManager.leaveRoom(x, clientInfo!));
                
                debug(`Client disconnected: ${socket.client.id}`);
            })

            socket.on(SocketEvents.joinRoom, (data: { roomId: string, userPrivateId: string }) => {
                debug(`Client joins room`, data);
                clientInfo = new UserInfo("","", data.userPrivateId);
                const room = roomManager.getRoom(data.roomId);
                if (room) {
                    socket.join(this.getRoomChannelId(room.id));
                    // TODO use roomManager to join the room here instead of opening the page.
                    this.emitPlayersChanged(room.id, room.players);
                }
            });
        });

        this.io = io;
    }

    emitPlayersChanged(roomId: string, players: UserInfo[]) {
        this.io.to(this.getRoomChannelId(roomId))
            .emit(SocketEvents.playersChanged, players);
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }

    private io!: Server;
}

export default new SocketManager();
