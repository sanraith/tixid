import { PublicUserInfo } from './model/publicUserInfo';
import { PublicPlayerState, PrivatePlayerState } from './model/playerState';

export enum ClientActions {
    joinRoom = "join_room",
    startGame = "start_game"
}

export enum ClientEvents {
    playersChanged = "players_changed",
    playerStateChanged = "player_state_changed",
    gameStarted = "game_started"
}

export interface EmitResponse {
    success: boolean;
    message?: string;
}

export interface PlayerStateChangedData {
    playerStates: (PublicPlayerState | PrivatePlayerState)[]
}

export interface PlayersChangedData {
    owner: PublicUserInfo,
    players: PublicUserInfo[],
}

export interface JoinRoomData {
    roomId: string
}
