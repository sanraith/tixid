import { PublicUserInfo } from 'src/shared/model/publicUserInfo'
import { Card } from 'src/shared/model/card';

export default class RoomModel {
    id: string;
    owner: PublicUserInfo;
    players: PublicUserInfo[];

    hand: Card[];
}