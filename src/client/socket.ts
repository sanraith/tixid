declare var io: SocketIOClientStatic;

$(function () {
    const roomId = /.*\/(?<roomId>[^\/]+)\/?/.exec(window.location.href).groups.roomId;
    const socket = io();
    const userInfo = getUserInfo();

    socket.on("connect", () => {
        socket.on("players_changed", (players: { name: string }[]) => {
            render.playerList(players);
        });
        socket.emit("join_room", { roomId: roomId, userPrivateId: userInfo.secret });
    });
});