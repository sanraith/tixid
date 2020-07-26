import { PublicUserInfo } from './model/publicUserInfo';
import { PublicPlayerState, PrivatePlayerState } from './model/sharedPlayerState';
import PublicGameState from './model/publicGameState';
import { Rules } from 'src/shared/model/rules';

export enum ClientActions {
    joinRoom = "join_room",
    leaveRooms = "leave_rooms",
    goToLobby = "go_to_lobby",
    startGame = "start_game",
    makeStory = "make_story",
    extendStory = "extend_story",
    voteStory = "vote_story",
    partialResults = "partial_results",
    startRound = "start_round",
    indicateReady = "indicate_ready",
    forceReady = "force_ready",
    takeOwnership = "take_ownership",
    kickPlayer = "kick_player"
}

export enum ClientEvents {
    connect = "connect",
    disconnect = "disconnect",
    kickedFromRoom = "kicked_from_room",

    playersChanged = "players_changed",

    playerStateChanged = "player_state_changed",
    gameStateChanged = "game_state_changed",

    gameStarted = "game_started",
}

export interface EmitResponse {
    success: boolean;
    message?: string;
}

export interface JoinRoomResponse extends EmitResponse {
    name?: string;
}

export interface GameStateChangedData extends PublicGameState { }

export interface PlayerStateChangedData {
    playerStates: (PublicPlayerState | PrivatePlayerState)[],
    isCompleteList: boolean
}

export interface PlayersChangedData {
    owner: PublicUserInfo,
    players: PublicUserInfo[],
}

export interface StartGameData {
    rules: Rules
}

export interface JoinRoomData {
    roomId: string
}

export interface MakeStoryData {
    story: string,
    cardId: string
}

export interface ExtendStoryData {
    cardId: string
}

export interface VoteStoryData extends ExtendStoryData { }

export interface KickPlayerData {
    publicId: string
}

export interface KickedFromRoomData {
    roomId: string,
    reason: string
}