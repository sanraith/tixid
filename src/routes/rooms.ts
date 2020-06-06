import express from 'express';
import Debug from 'debug';
import roomManager from 'services/roomManager';
import RoomsViewModel from 'viewModels/roomViewModel';
const debug = Debug('qind:routes:room');

const router = express.Router();

router.get("/", (req, res) => {
    const rooms = roomManager.getRooms();
    res.render("rooms", new RoomsViewModel("Rooms", rooms));
})

router.post("/create", (req, res, next) => {
    debug("Create called!");
    const newRoom = roomManager.create();
    res.json(newRoom);
});

export default router;