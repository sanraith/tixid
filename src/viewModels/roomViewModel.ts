import PageViewModel from "./pageViewModel"
import Room from "models/room";

export default class RoomsViewModel extends PageViewModel {
    constructor(title: string, public rooms: Room[]) {
        super(title);
    }
}