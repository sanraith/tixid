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
        const result: Room[] = [];
        for (const key in this._rooms) {
            result.push(this._rooms[key]);
        }
        return result;
    }

    getRoom(id: string): Room | undefined {
        return this._rooms[id];
    }

    joinRoom(room: Room, player: UserInfo) {
        if (!room.players.some(x => x.secret == player.secret)) {
            room.players.push(player);
            return true;
        }
        return false;
    }

    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
