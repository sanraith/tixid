import { PublicUserInfo } from './publicUserInfo';

export enum ClientActions {
    joinRoom = "join_room"
}

export enum ClientEvents {
    playersChanged = "players_changed"
}

export interface PlayersChangedData {
    owner: PublicUserInfo,
    players: PublicUserInfo[],
}

export interface JoinRoomData {
    roomId: string
}
