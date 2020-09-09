import { GameStep } from './gameStep';
import { PublicUserInfo } from './publicUserInfo';
import PickedCard from './pickedCard';
import { RoundPointReason } from 'src/server/models/gameState';
import { Rules } from './rules';

export default interface PublicGameState {
    step: GameStep;
    rules: Rules;
    cardPoolCount: number;
    discardPileCount: number;

    storyTeller?: PublicUserInfo;
    story?: string;
    storyCardId?: string;
    storyCardPile?: PickedCard[];

    votes?: { userInfo: PublicUserInfo, cardIds?: string[] }[];
    votePoints?: { userInfo: PublicUserInfo, points: number, reason: RoundPointReason }[];
}
