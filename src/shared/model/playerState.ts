import { PublicUserInfo } from './publicUserInfo';

export interface PublicPlayerState {
    player: PublicUserInfo;
    handSize: number;
    points: number;
}

export interface PrivatePlayerState extends PublicPlayerState {
    hand: string[];
}