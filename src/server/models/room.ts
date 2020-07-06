import UserInfo from "./userInfo";
import GameState from './gameState';

export default interface Room {
    id: string,
    owner: UserInfo,
    players: UserInfo[],
    state: GameState
}
