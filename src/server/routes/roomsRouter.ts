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
                name: r.name,
                owner: r.owner.publicInfo,
                players: r.players.map(p => p.publicInfo)
            }))
        });
    });
})

router.post("/create", (req, res) => {
    errorHandler(res, () => {
        const owner = userManager.getUserFromCookies(req.cookies);
        const roomName = req.body?.name ?? `${owner.name}'s room`;
        const room = roomManager.createRoom(owner, roomName);
        debug(`Room: ${room.id} Owner: ${owner.name} ${owner.publicId}`);

        res.json(<CreateRoomResponse>{
            id: room.id,
            name: room.name
        });
    });
});

export default router;