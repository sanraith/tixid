import SocketIo from 'socket.io';
import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
import { JoinRoomData, EmitResponse, MakeStoryData } from '../../shared/socket';
import Room from '../models/room';
import GameManager from './gameManager';
import { defaultRules } from '../models/rules';
import cardManager from './cardManager';
import Debug from 'debug';
import socketManager from './socketManager';
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
        debug(`Client ${this.userInfo.name} joins room`, data);
        this.room = roomManager.getRoom(data.roomId);
        if (this.room) {
            this.socket.join(this.getRoomChannelId(this.room.id));
            roomManager.joinRoom(this.room, this.userInfo);
            socketManager.emitGameStateChanged(this.room, this.userInfo);
            if ((this.room.state?.players.length ?? 0) > 0) {
                socketManager.emitPlayerStateChanged(this.room, this.room?.state.players, this.userInfo);
            }
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
        debug("Requested start game");
        const result = manager.startGame(defaultRules, Object.values(cardManager.sets));
        return result;
    }

    makeStory({ story, cardId }: MakeStoryData): EmitResponse {
        if (!this.room) { return { success: false, message: "Cannot start the game while not being in a room!" }; }
        if (this.room.state.storyTeller?.userInfo !== this.userInfo) { return { success: false, message: "Only the storyTeller can create a story!" }; }

        const manager = new GameManager(this.room);
        debug("Requested make story");
        const result = manager.makeStory(story, cardManager.cards[cardId]);

        return result;
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}
