import UserInfo from "./userInfo";
import GameState from './gameState';

export default interface Room {
    id: string;
    name: string;
    owner: UserInfo;
    players: UserInfo[];
    state: GameState;
    creationDate: Date;
    lastInteraction: Date;
}
