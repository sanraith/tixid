import { PublicUserInfo } from 'src/shared/model/publicUserInfo'
import { PublicPlayerState } from 'src/shared/model/sharedPlayerState';
import PublicGameState from 'src/shared/model/publicGameState';
import { ClientUser } from '../services/user.service';
import { Socket } from 'ngx-socket-io';

export class LocalGameState {
    mySubmittedCardId?: string;
    myVotedCardId?: string;
    voteCardIds?: string[];
    votesByCardId?: Record<string, PublicUserInfo[]>;
}

export class PlayerState {
    players: PublicPlayerState[] = [];
    hand: string[];
};

export default class RoomModel {
    id: string;
    currentUser: ClientUser;
    socket: Socket;

    owner: PublicUserInfo;
    players: PublicUserInfo[];

    playerState: PlayerState = new PlayerState();
    gameState: PublicGameState;
    localState: LocalGameState = new LocalGameState();
}