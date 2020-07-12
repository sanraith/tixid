import { PublicUserInfo } from './publicUserInfo';

export interface PublicPlayerState {
    userInfo: PublicUserInfo;
    handSize: number;
    points: number;
    isReady: boolean;
    isConnected: boolean;
}

export interface PrivatePlayerState extends PublicPlayerState {
    hand: string[];
}