import Debug from 'debug';
import shortid from 'shortid';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import socketManager from './socketManager';
const debug = Debug("tixid:services:roomManager");

class RoomManager {
    createRoom(owner: UserInfo): Room {
        const newRoom: Room = {
            id: this._roomIdGenerator.generate(),
            owner: owner,
            players: []
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

    joinRoom(room: Room, player: UserInfo) {
        const existingUserIndex = room.players.findIndex(x => player.id == x.id);
        const playerExists = existingUserIndex >= 0;
        if (playerExists) {
            // Always overwrite user data in case of name refresh
            room.players[existingUserIndex] = player;
        } else {
            room.players.push(player);
        }

        socketManager.emitPlayersChanged(room.id, room.players);

        return playerExists;
    }

    leaveRoom(room: Room, player: UserInfo) {
        const existingUserIndex = room.players.findIndex(x => player.id == x.id);
        if (existingUserIndex < 0) { return; }

        const leftPlayer = room.players.splice(existingUserIndex, 1)[0];
        socketManager.emitPlayersChanged(room.id, room.players);

        // TODO handle owner change

        debug(`Client ${leftPlayer.name} left room ${room.id}`);
    }

    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
