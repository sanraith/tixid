import { PublicUserInfo } from 'src/shared/publicUserInfo'

export default class RoomModel {
    id: string;
    owner: PublicUserInfo;
    players: PublicUserInfo[];
}