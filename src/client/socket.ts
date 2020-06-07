declare var io: SocketIOClientStatic;

$(function () {
    const roomId = /.*\/(?<roomId>[^\/]+)\/?/.exec(window.location.href).groups.roomId;
    const socket = io();
    const userInfo = getUserInfo();

    socket.on("connect", () => {
        socket.emit("join_room", { roomId: roomId, userPrivateId: userInfo.secret });
    });
});