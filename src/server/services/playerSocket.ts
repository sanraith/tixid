import SocketIo from 'socket.io';
import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
import { JoinRoomData, EmitResponse, MakeStoryData, ExtendStoryData, VoteStoryData, StartGameData } from '../../shared/socket';
import Room from '../models/room';
import GameManager from './gameManager';
import { getDefaultRules } from '../../shared/model/rules';
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
    manager?: GameManager;
    socket: SocketIo.Socket;

    constructor(user: UserInfo, socket: SocketIo.Socket) {
        this.userInfo = user;
        this.socket = socket;
    }

    joinRoom(data: JoinRoomData): EmitResponse {
        debug(`Client ${this.userInfo.name} joins room`, data);
        this.room = roomManager.getRoom(data.roomId);
        if (this.room) {
            this.manager = new GameManager(this.room);
            this.socket.join(this.getRoomChannelId(this.room.id));
            roomManager.joinRoom(this.room, this.userInfo);
            socketManager.emitGameStateChanged(this.room, this.userInfo);

            // Set connection state 
            const playerState = this.room?.state.players.find(x => x.userInfo === this.userInfo);
            if (playerState && !playerState.isConnected) {
                playerState.isConnected = true;
                socketManager.emitPlayerStateChanged(this.room, [playerState]);
            }

            if ((this.room.state?.players.length ?? 0) > 0) {
                socketManager.emitPlayerStateChanged(this.room, this.room?.state.players, this.userInfo);
            }
            return { success: true };
        }
        else {
            return { success: false };
        }
    }

    leaveRooms() {
        roomManager.getRooms()
            .filter(x => x.players.some(p => this.userInfo.id === p.id))
            .forEach(x => roomManager.leaveRoom(x, this.userInfo));
        debug(`Client ${this.userInfo.name} left all rooms.`);
        return { success: true };
    }

    disconnect() {
        const playerState = this.room?.state.players.find(x => x.userInfo === this.userInfo);
        if (this.room && playerState && playerState.isConnected) {
            playerState.isConnected = false;
            socketManager.emitPlayerStateChanged(this.room, [playerState]);
        }

        this.socket.disconnect();
        debug(`Client ${this.userInfo.name} disconnected: ${this.socket.client.id}`);
    }

    startGame(data?: StartGameData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner of the room can start the game!" };
        }

        debug(`Requested start game by ${this.userInfo.name}`);
        const rules = data?.rules ?? this.room.state.rules ?? getDefaultRules();
        const result = this.manager.startGame(rules, Object.values(cardManager.sets));
        return result;
    }

    makeStory({ story, cardId }: MakeStoryData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.storyTeller?.userInfo !== this.userInfo) { return { success: false, message: "Only the storyTeller can create a story!" }; }

        debug(`Requested make story by ${this.userInfo.name}`);
        return this.manager.makeStory(story, cardManager.cards[cardId]);
    }

    extendStory(data: ExtendStoryData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }

        debug(`Requested extend story by ${this.userInfo.name}`);
        const card = cardManager.cards[data.cardId];
        return this.manager.extendStory(this.userInfo, card);
    }

    voteStory(data: VoteStoryData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }

        debug(`Requested vote story by ${this.userInfo.name}`);
        const card = cardManager.cards[data.cardId];
        return this.manager.voteStory(this.userInfo, card);
    }

    partialResults(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner can show partial results!" };
        }

        debug(`Requested partial results by ${this.userInfo.name}`);
        return this.manager.applyPointsAndShowPartialResults();
    }

    startRound(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner can start the round!" };
        }

        debug(`Requested start round by ${this.userInfo.name}`);
        return this.manager.startRound();
    }

    goToLobby(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner move room to lobby!" };
        }

        debug(`Requested go to lobby by ${this.userInfo.name}`);
        return this.manager.goToLobby();
    }

    indicateReady(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }

        debug(`Requested indicate ready by ${this.userInfo.name}`);
        return this.manager.indicatePlayerReady(this.userInfo);
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}
