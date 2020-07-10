import { PublicUserInfo } from './publicUserInfo';

export interface PublicPlayerState {
    userInfo: PublicUserInfo;
    handSize: number;
    points: number;
}

export interface PrivatePlayerState extends PublicPlayerState {
    hand: string[];
}