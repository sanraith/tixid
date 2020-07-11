import SocketIo from 'socket.io';
import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
import { JoinRoomData, EmitResponse } from '../../shared/socket';
import Room from '../models/room';
import { userInfo } from 'os';
import GameManager from './gameManager';
import { defaultRules } from '../models/rules';
import cardManager from './cardManager';
import Debug from 'debug';
const debug = Debug('tixid:services:playerSocket');

/**
 * Handles a socket associated with a single player.
 */
export default class PlayerSocket {
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
        }
        else {
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
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) { return { success: false, message: "Only the owner of the room can start the game!" }; }
        
        const manager = new GameManager(this.room);
        debug("Requested deal cards");
        const result = manager.startGame(defaultRules, Object.values(cardManager.sets));
        return result;
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}
