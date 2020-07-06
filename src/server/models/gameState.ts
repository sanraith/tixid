import { GameStep } from 'src/shared/model/gameStep';
import { Card } from 'src/shared/model/card';
import UserInfo from './userInfo';

export default class GameState {
    step: GameStep = GameStep.lobby;
    cardPool: Card[] = [];
    discardPile: Card[] = [];
    players: Record<string, {
        info: UserInfo, // probably redundant
        hand: Card[],
        points: number
    }>
}