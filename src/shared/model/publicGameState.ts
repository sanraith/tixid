import { GameStep } from './gameStep';
import { PublicUserInfo } from './publicUserInfo';
import StoryCard from './storyCard';

export default interface PublicGameState {
    step: GameStep;
    cardPoolCount: number;
    discardPileCount: number;

    storyTeller?: PublicUserInfo;
    story?: string;
    storyCardId?: string;
    storyCardPile?: StoryCard[];

    votes?: { userInfo: PublicUserInfo, cardId: string }[];
}