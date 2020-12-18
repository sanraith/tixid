import Debug from 'debug';
import shortid from 'shortid';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import socketManager from './socketManager';
import { GameStep } from '../../shared/model/gameStep';
import GameState from '../models/gameState';
const debug = Debug("tixid:services:roomManager");

class RoomManager {
    createRoom(owner: UserInfo, name: string): Room {
        const newRoom: Room = {
            id: this._roomIdGenerator.generate(),
            name: name,
            owner: owner,
            players: [],
            state: new GameState(),
        };
        this._rooms[newRoom.id] = newRoom;

        debug(`Created: ${newRoom.id} for ${owner.name}`);
        return newRoom;
    }

    getRooms(): Room[] {
        return Object.values(this._rooms);
    }

    getRoom(id: string): Room | undefined {
        return this._rooms[id];
    }

    joinRoom(room: Room, player: UserInfo): boolean {
        const playerIndex = room.players.findIndex(x => player.id == x.id);
        const isPlayerAlreadyJoined = playerIndex >= 0;
        if (!isPlayerAlreadyJoined) {
            room.players.push(player);
        }

        socketManager.emitPlayersChanged(room);

        return !isPlayerAlreadyJoined;
    }

    leaveRoom(room: Room, player: UserInfo): void {
        const existingUserIndex = room.players.findIndex(x => player.id == x.id);
        if (existingUserIndex < 0) { return; }

        const leftPlayer = room.players.splice(existingUserIndex, 1)[0];
        if (room.players.length === 0) {
            // Delete room after some time if no players rejoin
            // TODO refine this to cancel timeout after someone rejoins
            debug(`Delete room in 60 sec: ${room.id}`);
            setTimeout(() => {
                if (room.players.length === 0) { this.deleteRoom(room); }
            }, 60000);
        }

        socketManager.emitPlayersChanged(room);

        debug(`Client ${leftPlayer.name} left room ${room.id}`);
        debug(`Remaining: ${room.players.length}`);
    }

    deleteRoom(room: Room) {
        delete this._rooms[room.id];
        debug(`Room ${room.id} deleted.`);
    }

    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
