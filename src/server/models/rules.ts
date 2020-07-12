export interface Rules {
    handSize: number;
    onlyOwnerCanStart: boolean;
    invalidStateChanges: boolean;

    pointsSomebodyGuessedRight: number;
    pointsNobodyOrEverybodyGuessedRight: number;

    pointsDeceivedSomebody: number,
    pointsMaxDeceivedSomebody: number,

    pointsToWin: number
}

export const defaultRules: Rules = {
    handSize: 5,
    onlyOwnerCanStart: false,
    invalidStateChanges: true,

    pointsSomebodyGuessedRight: 3,
    pointsNobodyOrEverybodyGuessedRight: 2,
    pointsDeceivedSomebody: 1,
    pointsMaxDeceivedSomebody: 3,

    pointsToWin: 5
};