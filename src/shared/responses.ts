import { PublicUserInfo } from './publicUserInfo';

export interface CreateRoomResponse {
    id: string
}

export interface GetRoomListResponse {
    rooms: {
        id: string,
        owner: PublicUserInfo,
        players: PublicUserInfo[]
    }[]
}