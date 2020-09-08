import SocketIo from 'socket.io';
import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
import { JoinRoomData, EmitResponse, MakeStoryData, ExtendStoryData, VoteStoryData, StartGameData, KickPlayerData, JoinRoomResponse } from '../../shared/socket';
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

    // TODO handle room player info (before game started) or refactor the 2 kinds of player infos into one.
    joinRoom(data: JoinRoomData): JoinRoomResponse {
        debug(`Client ${this.userInfo.name} joins room`, data);
        this.room = roomManager.getRoom(data.roomId);
        if (this.room) {
            this.manager = new GameManager(this.room);
            this.socket.join(this.getRoomChannelId(this.room.id));
            roomManager.joinRoom(this.room, this.userInfo);
            socketManager.emitGameStateChanged(this.room, this.userInfo);

            // Set connection state
            const playerState = this.room.state.players.find(x => x.userInfo === this.userInfo);
            if (playerState && !playerState.isConnected) {
                playerState.isConnected = true;
                socketManager.emitPlayerStateChanged(this.room, [playerState]);
            }

            if ((this.room.state.players.length ?? 0) > 0) {
                socketManager.emitPlayerStateChanged(this.room, this.room.state.players, this.userInfo, true);
            }
            return { name: this.room.name, success: true };
        }
        else {
            return { success: false };
        }
    }

    leaveRoom(): EmitResponse {
        if (this.room) {
            debug(`Client ${this.userInfo.name} left room ${this.room.id}.`);
            roomManager.leaveRoom(this.room, this.userInfo);
            return { success: true };
        } else {
            debug(`Client ${this.userInfo.name} tried to leave room, but is not part of any room!`);
            return { success: false };
        }
    }

    markPlayerAsDisconnected() {
        const playerState = this.room?.state.players.find(x => x.userInfo === this.userInfo);
        if (this.room && playerState && playerState.isConnected) {
            debug(`Setting disconnect state for player ${this.userInfo.name} on room ${this.room.id}.`);
            playerState.isConnected = false;
            socketManager.emitPlayerStateChanged(this.room, [playerState]);
        }
    }

    startGame(data?: StartGameData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner of the room can start the game!" };
        }

        debug(`Requested start game by ${this.userInfo.name}`);
        const rules = data?.rules ?? this.room.state.rules ?? getDefaultRules();
        let sets = Object.values(cardManager.sets);
        if (rules.cardSets && rules.cardSets.length > 0) {
            sets = rules.cardSets.map(x => cardManager.sets[x]);
            if (sets.some(x => !x)) {
                return { success: false, message: "Some of the requested sets do not exists!" }
            }
        }

        const result = this.manager.startGame(rules, sets);
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
        const cards = data.cardIds.map(cardId => cardManager.cards[cardId]);
        return this.manager.extendStory(this.userInfo, cards);
    }

    voteStory(data: VoteStoryData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }

        debug(`Requested vote story by ${this.userInfo.name}`);
        const card = cardManager.cards[data.cardId];
        return this.manager.voteStory(this.userInfo, card);
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

    forceReady(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner can force ready states!" };
        }

        debug(`Requested force ready by ${this.userInfo.name}`);
        let result = { success: true };
        for (let playerInfo of this.room.state.players.filter(x => !x.isReady)) {
            result = this.manager.indicatePlayerReady(playerInfo.userInfo);
            if (!result.success) {
                debug("Force ready not successful.");
                return result;
            }
        }

        return result;
    }

    takeOwnership(): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }

        const currentOwner = this.room!.owner;
        const currentOwnerState = this.room.state.players.find(x => x.userInfo === currentOwner);
        if (currentOwnerState && currentOwnerState.isConnected) { return { success: false, message: "Can only take ownership from disconnected players!" }; }

        debug(`Requested take ownership ready by ${this.userInfo.name}`);
        this.room.owner = this.userInfo;
        socketManager.emitPlayersChanged(this.room);

        return { success: true };
    }

    kickPlayer(data: KickPlayerData): EmitResponse {
        if (!this.room || !this.manager) { return { success: false, message: "Player is not part of any room!" }; }
        if (this.room.state.rules.onlyOwnerCanStart && this.room.owner !== this.userInfo) {
            return { success: false, message: "Only the owner can kick other players from the room!" };
        }

        const player = this.room.state.players.map(x => x.userInfo).find(x => x.publicId === data.publicId);
        if (!player) {
            return { success: false, message: "Kicked player is not part of the room!" };
        }

        const result = this.manager.kickPlayer(player);
        if (result) {
            roomManager.leaveRoom(this.room, player);
        }
        return result;
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}
