import express from 'express';
import Debug from 'debug';
import roomManager from '../services/roomManager';
import userManager from '../services/userManager';
import { CreateRoomResponse, GetRoomListResponse } from 'src/shared/responses';
import routerErrorHandler from './routerErrorHandler';
import socketManager from '../services/socketManager';

const debug = Debug('tixid:routes:room');
const errorDebug = Debug('tixid:routes:room:ERROR');
const errorHandler = routerErrorHandler(errorDebug);
const router = express.Router();
const DEBUG_SECRET = process.env.DEBUG_SECRET;

router.get("/", (req, res) => {
    errorHandler(res, () => {
        const rooms = roomManager.getRooms();
        res.json(<GetRoomListResponse>{
            rooms: rooms.map(r => ({
                id: r.id,
                name: r.name,
                owner: r.owner.publicInfo,
                players: r.players.map(p => p.publicInfo),
                creationDate: r.creationDate,
                lastInteraction: r.lastInteraction
            }))
        });
    });
});

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

router.get("/debug/:secret", (req, res) => {
    errorHandler(res, () => {
        if (req.params['secret'] !== DEBUG_SECRET) {
            res.send('NONONO');
            return;
        }

        res.json({
            rooms: roomManager.getRooms(),
            connections: Object.entries(socketManager._getSocketsForDebug())
                .map(entry => ({
                    userId: entry[0],
                    value: entry[1]
                }))
                .map(x => ({
                    userId: x.userId,
                    userName: userManager.getUserByPrivateId(x.userId).name,
                    connectionCount: x.value.length,
                    sockets: x.value.map(ps => ({
                        roomId: ps.room?.id,
                        roomName: ps.room?.name,
                        socketId: ps.socket.id,
                        connected: ps.socket.connected
                    }))
                }))
        });
    });
});

export default router;
