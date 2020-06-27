import express from 'express';
import Debug from 'debug';
import roomManager from '../services/roomManager';
import userManager from '../services/userManager';
import { CreateRoomResponse, GetRoomListResponse } from 'src/shared/responses';

const debug = Debug('tixid:routes:room');
const router = express.Router();

router.get("/", (req, res) => {
    const rooms = roomManager.getRooms();
    res.json(<GetRoomListResponse>{
        rooms: rooms.map(r => ({
            id: r.id,
            owner: r.owner.publicInfo,
            players: r.players.map(p => p.publicInfo)
        }))
    });
})

router.post("/create", (req, res) => {
    const owner = userManager.getUserFromCookies(req.cookies);
    const room = roomManager.createRoom(owner);
    debug(`Room: ${room.id} Owner: ${owner.name} ${owner.publicId}`);

    res.json(<CreateRoomResponse>room);
});

export default router;