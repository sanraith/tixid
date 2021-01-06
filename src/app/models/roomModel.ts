import { PublicUserInfo } from 'src/shared/model/publicUserInfo';
import { PublicPlayerState, PrivatePlayerState } from 'src/shared/model/sharedPlayerState';
import PublicGameState from 'src/shared/model/publicGameState';
import { ClientUser } from '../services/user.service';
import { Socket } from 'ngx-socket-io';

export class LocalGameState {
    mySubmittedCardIds: string[] = [];
    myVotedCardIds: string[] = [];
    voteCardIds: string[] = [];
    votesByCardId?: Record<string, PublicUserInfo[]>;
    orderedPlayerResults?: { userInfo: PublicUserInfo, newPoints: number, totalPoints: number; }[];
}

export default class RoomModel {
    id: string;
    name?: string;
    currentUser: ClientUser;
    socket: Socket;
    get isSpectator(): boolean {
        return this.spectators.some(x => x.id === this.currentUser.id);
    };

    owner: PublicUserInfo;
    players: PublicUserInfo[] = [];
    spectators: PublicUserInfo[] = [];

    playerStates: PublicPlayerState[] = [];
    myState?: PrivatePlayerState;

    gameState: PublicGameState;
    localState: LocalGameState = new LocalGameState();
}
