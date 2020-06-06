import Debug from 'debug';
import shortid from 'shortid';
import Room from 'models/room';
import UserInfo from 'models/userInfo';
const debug = Debug("qind:services:roomManager");

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
        const existingUserIndex = room.players.findIndex(x => player.idEquals(x));
        if (existingUserIndex >= 0) {
            // Always overwrite user data in case of name refresh
            room.players[existingUserIndex] = player;
            return true;
        }

        room.players.push(player);
        return false;
    }

    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
