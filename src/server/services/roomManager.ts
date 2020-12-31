import Debug from 'debug';
import shortid from 'shortid';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import socketManager from './socketManager';
import GameState from '../models/gameState';
import dayjs from 'dayjs';
const debug = Debug("tixid:services:roomManager");

class RoomManager {
    constructor() {
        this.periodicallyRemoveInactiveRooms();
    }

    createRoom(owner: UserInfo, name: string): Room {
        const newRoom: Room = {
            id: this._roomIdGenerator.generate(),
            name: name,
            owner: owner,
            players: [],
            state: new GameState(),
            lastInteraction: new Date()
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
        socketManager.emitPlayersChanged(room);

        debug(`Client ${leftPlayer.name} left room ${room.id}`);
        debug(`Remaining: ${room.players.length}`);
    }

    deleteRoom(room: Room) {
        delete this._rooms[room.id];
        debug(`Room ${room.id} deleted.`);
    }

    /** Updates the room's 'lastInteraction' field indicating that the room is active. */
    interact(room: Room) {
        room.lastInteraction = new Date();
    }

    private periodicallyRemoveInactiveRooms() {
        const rooms = this.getRooms();
        if (rooms.length > 0) {
            debug(`Deleting rooms inactive for at least ${this.minInactiveMinutesToDeleteRoom} minutes. ` +
                `Interval: every ${this.houseKeepingIntervalMs / 1000 / 60} minutes.`);

            const now = dayjs();
            for (let room of this.getRooms()) {
                const diffMinutes = now.diff(dayjs(room.lastInteraction), 'minute');
                if (diffMinutes < this.minInactiveMinutesToDeleteRoom) {
                    continue;
                }

                debug(`Deleting room ${room.id} because it was inactive for ${diffMinutes} minutes.`);
                for (let player of room.players) {
                    socketManager.emitKickedFromRoom(room, player,
                        `Room has been deleted because it has been inactive for at least ${this.minInactiveMinutesToDeleteRoom} minutes.`);
                }
                this.deleteRoom(room);
            }
        }

        setTimeout(() => this.periodicallyRemoveInactiveRooms(), this.houseKeepingIntervalMs);
    }

    _roomIdGenerator: { generate(): string } = shortid;

    private houseKeepingIntervalMs = 15 * 60 * 1000; // Every 15 minutes
    private minInactiveMinutesToDeleteRoom = 4 * 60; // 4 hours
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomManager();
