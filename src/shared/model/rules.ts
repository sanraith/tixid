export interface Rules {
    handSize: number;
    onlyOwnerCanStart: boolean;
    invalidStateChanges: boolean;

    pointsSomebodyGuessedRight: number;
    pointsNobodyOrEverybodyGuessedRight: number;

    pointsDeceivedSomebody: number,
    maxPointsDeceivedSomebody: number,

    pointsToWin: number
}

export function getDefaultRules(): Rules {
    return {
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