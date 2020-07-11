import { GameStep } from './gameStep';
import { PublicUserInfo } from './publicUserInfo';

export default interface PublicGameState {
    step: GameStep,
    cardPoolCount: number,
    discardPileCount: number,

    storyTeller?: PublicUserInfo,
    story?: string,
    storyCardId?: string
}