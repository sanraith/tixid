import { PublicUserInfo } from './model/publicUserInfo';

export interface CreateRoomRequest{
    name: string
}

export interface CreateRoomResponse {
    id: string,
    name: string
}

export interface GetRoomListResponse {
    rooms: {
        id: string,
        name: string,
        owner: PublicUserInfo,
        players: PublicUserInfo[]
    }[]
}

export interface CardSetInfo {
    id: string,
    name: string,
    cardCount: number,
    cards: string[]
}

export interface GetCardSetsResponse {
    cardSets: CardSetInfo[]
}