import { PublicUserInfo } from 'src/shared/model/publicUserInfo'
import { Card } from 'src/shared/model/card';
import { PublicPlayerState } from 'src/shared/model/playerState';

export class GameState {
    players: PublicPlayerState[] = [];
    hand: Card[];
}

export default class RoomModel {
    id: string;
    owner: PublicUserInfo;
    players: PublicUserInfo[];

    game: GameState;
}