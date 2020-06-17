export interface CreateRoomResponse {
    id: string
}

export interface GetRoomListResponse {
    rooms: {
        id: string,
        owner: {
            name: string
        },
        players: {
            name: string
        }[]
    }[]
}