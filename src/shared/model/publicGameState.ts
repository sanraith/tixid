import { GameStep } from './gameStep';
import { PublicUserInfo } from './publicUserInfo';
import PickedCard from './pickedCard';
import { RoundPointReason } from 'src/server/models/gameState';

export default interface PublicGameState {
    step: GameStep;
    cardPoolCount: number;
    discardPileCount: number;

    storyTeller?: PublicUserInfo;
    story?: string;
    storyCardId?: string;
    storyCardPile?: PickedCard[];

    votes?: { userInfo: PublicUserInfo, cardId?: string }[];
    votePoints?: { userInfo: PublicUserInfo, points: number, reason: RoundPointReason }[];
}