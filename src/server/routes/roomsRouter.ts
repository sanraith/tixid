import express from 'express';
import Debug from 'debug';
import roomManager from '../services/roomManager';
import userManager from '../services/userManager';

const debug = Debug('tixid:routes:room');
const router = express.Router();

router.get("/", (req, res) => {
    const rooms = roomManager.getRooms();
    res.json({ rooms: rooms });
})

router.post("/create", (req, res) => {
    const owner = userManager.getUserFromCookies(req.cookies);
    const room = roomManager.createRoom(owner);
    debug(`Room: ${room.id} Owner: ${owner.name} ${owner.publicId}`);

    res.json(room);
});

router.get("/:id", (req, res) => {
    const roomId = req.params.id;
    const room = roomManager.getRoom(roomId);
    if (!room) {
        debug(`Failed to join to ${roomId}.`);
        res.json({ error: `Failed to join to ${roomId}.` }); // TODO better error response
        return;
    }

    const player = userManager.getUserFromCookies(req.cookies);
    roomManager.joinRoom(room, player);
    debug(`Player ${player.name} joined to room ${room.id}`);

    res.json(room);
});

export default router;