import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import Debug from 'debug';
const debug = Debug('tixid:services:socketManager');

class SocketManager {
    init(httpServer: HttpServer) {
        const io = SocketIo(httpServer);

        io.on("connection", (socket) => {
            debug(`Client connected: ${socket.client.id}`);
            socket.on("disconnect", () => {
                debug(`Client disconnected: ${socket.client.id}`);
            })
            socket.on("join_room", (data: any) => {
                debug(`Client joins room`, data);
            });
        });

        this.io = io;
    }

    private io!: Server;
}

export default new SocketManager();
