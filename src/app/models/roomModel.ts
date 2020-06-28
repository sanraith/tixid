import { PublicUserInfo } from 'src/shared/model/publicUserInfo'

export default class RoomModel {
    id: string;
    owner: PublicUserInfo;
    players: PublicUserInfo[];
}