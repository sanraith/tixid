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
            spectators: [],
            state: new GameState(),
            creationDate: new Date(),
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

    joinRoom(room: Room, player: UserInfo, isSpectator: boolean): boolean {
        const targetGroup = isSpectator ? room.spectators : room.players;
        const playerIndex = targetGroup.findIndex(x => player.id == x.id);
        const isPlayerAlreadyJoined = playerIndex >= 0;
        if (!isPlayerAlreadyJoined) {
            targetGroup.push(player);
        }

        socketManager.emitPlayersChanged(room);

        return !isPlayerAlreadyJoined;
    }

    leaveRoom(room: Room, player: UserInfo): void {
        const targetGroup = room.players.includes(player) ? room.players : room.spectators;
        const existingUserIndex = targetGroup.findIndex(x => player.id == x.id);
        if (existingUserIndex < 0) { return; }

        const leftPlayer = targetGroup.splice(existingUserIndex, 1)[0];
        socketManager.emitPlayersChanged(room);

        debug(`Client ${leftPlayer.name} left room ${room.id}.`);
        debug(`Remaining: ${room.players.length} players, ${room.spectators.length} spectators`);
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
                for (let player of [...room.players, ...room.spectators]) {
                    socketManager.emitKickedFromRoom(room, player,
                        `Room has been deleted because it has been inactive for at least ${this.minInactiveMinutesToDeleteRoom} minutes.`);
                }
                this.deleteRoom(room);
            }
        }

        setTimeout(() => this.periodicallyRemoveInactiveRooms(), this.houseKeepingIntervalMs);
    }

    _roomIdGenerator: { generate(): string; } = shortid;

    private houseKeepingIntervalMs = 15 * 60 * 1000; // Every 15 minutes
    private minInactiveMinutesToDeleteRoom = 4 * 60; // 4 hours
    private _rooms: { [id: string]: Room; } = {};
}

export default new RoomManager();
