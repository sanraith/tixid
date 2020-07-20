import express from 'express';
import Debug from 'debug';
import roomManager from '../services/roomManager';
import userManager from '../services/userManager';
import { CreateRoomResponse, GetRoomListResponse } from 'src/shared/responses';
import routerErrorHandler from './routerErrorHandler';

const debug = Debug('tixid:routes:room');
const errorDebug = Debug('tixid:routes:room:ERROR');
const errorHandler = routerErrorHandler(errorDebug);
const router = express.Router();

router.get("/", (req, res) => {
    errorHandler(res, () => {
        const rooms = roomManager.getRooms();
        res.json(<GetRoomListResponse>{
            rooms: rooms.map(r => ({
                id: r.id,
                owner: r.owner.publicInfo,
                players: r.players.map(p => p.publicInfo)
            }))
        });
    });
})

router.post("/create", (req, res) => {
    errorHandler(res, () => {
        const owner = userManager.getUserFromCookies(req.cookies);
        const room = roomManager.createRoom(owner);
        debug(`Room: ${room.id} Owner: ${owner.name} ${owner.publicId}`);

        res.json(<CreateRoomResponse>room);
    });
});

export default router;