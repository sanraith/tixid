export enum ClientActions {
    joinRoom = "join_room"
}

export enum ClientEvents{
    playersChanged = "players_changed"
}

export interface JoinRoomData{
    roomId: string
}
