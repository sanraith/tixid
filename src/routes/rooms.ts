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
    const owner = UserInfo.createFrom(req.cookies);
    const room = roomManager.createRoom(owner);
    debug(`Room: ${room.id} Owner: ${owner.name} ${owner.id} ${owner.secret}`);

    res.json(room);
});

router.get("/join/:id", (req, res) => {
    const roomId = req.params.id;
    const room = roomManager.getRoom(roomId);
    if (!room) {
        debug(`Failed to join to ${roomId}.`)
        res.render("error", new ErrorViewModel("Room does not exists."));
        return;
    }

    const player = UserInfo.createFrom(req.cookies);
    roomManager.joinRoom(room, player);
    debug(`Player ${player.name} joined to room ${room.id}`);

    res.render("room", new RoomViewModel(room));
});

export default router;