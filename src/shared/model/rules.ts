export interface Rules {
    handSize: number;
    maxExtendCardCount: number;
    maxVoteCount: number;

    onlyOwnerCanStart: boolean;
    invalidStateChanges: boolean;

    pointsSomebodyGuessedRight: number;
    pointsSomebodyGuessedRightUsingMultipleVotes: number;
    pointsNobodyOrEverybodyGuessedRight: number;
    pointsDeceivedSomebody: number,
    maxPointsDeceivedSomebody: number,
    pointsToWin: number,

    cardSets: string[]
}

export function getDefaultRules(): Rules {
    return {
        cardSets: [], // Empty == all

        handSize: 6,
        maxExtendCardCount: 1,
        maxVoteCount: 1,

        onlyOwnerCanStart: false,
        invalidStateChanges: true,

        pointsSomebodyGuessedRight: 3,
        pointsSomebodyGuessedRightUsingMultipleVotes: 1,
        pointsNobodyOrEverybodyGuessedRight: 2,
        pointsDeceivedSomebody: 1,
        maxPointsDeceivedSomebody: 3,

        pointsToWin: 30
    }
};
