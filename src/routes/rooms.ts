import express from 'express';
import Debug from 'debug';
import roomManager from 'services/roomManager';
import RoomsViewModel from 'viewModels/roomViewModel';
import UserInfo from 'models/userInfo';
const debug = Debug('qind:routes:room');

const router = express.Router();

router.get("/", (req, res) => {
    debug(req.cookies);
    debug(req.headers);
    const rooms = roomManager.getRooms();
    res.render("rooms", new RoomsViewModel("Rooms", rooms));
})

router.post("/create", (req, res, next) => {
    debug("Create called!");
    debug(req.cookies);

    const owner = new UserInfo(req.cookies);
    debug(`Owner: ${owner.id} ${owner.secret}`);

    const newRoom = roomManager.create(owner);
    res.json(newRoom);
});

export default router;