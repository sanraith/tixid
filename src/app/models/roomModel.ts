import { PublicUserInfo } from 'src/shared/model/publicUserInfo'
import { PublicPlayerState, PrivatePlayerState } from 'src/shared/model/sharedPlayerState';
import PublicGameState from 'src/shared/model/publicGameState';
import { ClientUser } from '../services/user.service';
import { Socket } from 'ngx-socket-io';

export class LocalGameState {
    mySubmittedCardIds: string[] = [];
    myVotedCardIds: string[] = [];
    voteCardIds: string[] = [];
    votesByCardId?: Record<string, PublicUserInfo[]>;
    orderedPlayerResults?: { userInfo: PublicUserInfo, newPoints: number, totalPoints: number }[];
}

export default class RoomModel {
    id: string;
    name?: string;
    currentUser: ClientUser;
    socket: Socket;
    isSpectator: boolean;

    owner: PublicUserInfo;
    players: PublicUserInfo[] = [];
    get spectators(): PublicUserInfo[] {
        const playerStateIds = this.playerStates.map(ps => ps.userInfo.id);
        return this.players.filter(p => !playerStateIds.includes(p.id));
    };

    playerStates: PublicPlayerState[] = [];
    myState?: PrivatePlayerState;

    gameState: PublicGameState;
    localState: LocalGameState = new LocalGameState();
}
