import { PublicUserInfo } from 'src/shared/model/publicUserInfo'
import { Card } from 'src/shared/model/card';
import { PublicPlayerState } from 'src/shared/model/playerState';
import PublicGameState from 'src/shared/model/publicGameState';
import { ClientUser } from '../services/user.service';

export class PlayerState {
    players: PublicPlayerState[] = [];
    hand: Card[];
};

export default class RoomModel {
    id: string;
    currentUser: ClientUser;
    
    owner: PublicUserInfo;
    players: PublicUserInfo[];

    playerState: PlayerState = new PlayerState();
    gameState: PublicGameState;
}