import Debug from 'debug';
import shortid from 'shortid';
import Room from 'models/room';
import UserInfo from 'models/userInfo';
const debug = Debug("qind:services:roomManager");

class RoomManager {
    createRoom(owner: UserInfo): Room {
        const newRoom: Room = {
            id: shortid.generate(),
            owner: owner,
            players: []
        };
        this._rooms[newRoom.id] = newRoom;

        debug(`Created: ${newRoom.id}`);
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

    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
