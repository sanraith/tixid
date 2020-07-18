export interface Rules {
    handSize: number;
    onlyOwnerCanStart: boolean;
    invalidStateChanges: boolean;

    pointsSomebodyGuessedRight: number;
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
        onlyOwnerCanStart: false,
        invalidStateChanges: true,

        pointsSomebodyGuessedRight: 3,
        pointsNobodyOrEverybodyGuessedRight: 2,
        pointsDeceivedSomebody: 1,
        maxPointsDeceivedSomebody: 3,

        pointsToWin: 30
    }
};