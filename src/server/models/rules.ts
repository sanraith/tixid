export interface Rules {
    handSize: number;
    onlyOwnerCanStart: boolean;
    invalidStateChanges: boolean;
}

export const defaultRules: Rules = {
    handSize: 5,
    onlyOwnerCanStart: false,
    invalidStateChanges: true
};