import { PublicUserInfo } from './model/publicUserInfo';

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

export interface CardSetInfo {
    id: string,
    name: string,
    cardCount: number,
    cards: string[]
}

export interface GetCardSetsResponse {
    cardSets: CardSetInfo[]
}