import PageViewModel from "./pageViewModel"
import Room from "models/room";

export class RoomsViewModel extends PageViewModel {
    constructor(public rooms: Room[]) {
        super("Rooms");
    }
}

export class RoomViewModel extends PageViewModel {
    constructor(public room: Room) {
        super(`${room.owner.name}'s Room`);
    }
}