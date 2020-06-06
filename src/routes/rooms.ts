import express from 'express';
import Debug from 'debug';
import roomManager from 'services/roomManager';
import UserInfo from 'models/userInfo';
import { RoomViewModel, RoomsViewModel } from 'viewModels/roomViewModel';
import ErrorViewModel from 'viewModels/errorViewModel';

const debug = Debug('qind:routes:room');
const router = express.Router();

router.get("/", (req, res) => {
    const rooms = roomManager.getRooms();
    res.render("rooms", new RoomsViewModel(rooms));
})

router.post("/create", (req, res) => {
    debug("Create called!");

    const owner = new UserInfo(req.cookies);
    debug(`Owner: ${owner.name} ${owner.id} ${owner.secret}`);

    const newRoom = roomManager.createRoom(owner);
    res.json(newRoom);
});

router.get("/join/:id", (req, res) => {
    const roomId = req.params.id;
    const room = roomManager.getRoom(roomId);
    if (!room) {
        res.render("error", new ErrorViewModel("Room does not exists."));
        return;
    }
    res.render("room", new RoomViewModel(room));
});

export default router;