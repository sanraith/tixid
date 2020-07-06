import { PublicUserInfo } from './model/publicUserInfo';

export enum ClientActions {
    joinRoom = "join_room",
    startGame = "start_game"
}

export enum ClientEvents {
    playersChanged = "players_changed"
}

export interface EmitResponse {
    success: boolean;
}

export interface PlayersChangedData {
    owner: PublicUserInfo,
    players: PublicUserInfo[],
}

export interface JoinRoomData {
    roomId: string
}
