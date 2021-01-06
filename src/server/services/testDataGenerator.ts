import roomManager from './roomManager';
import UserInfo from '../models/userInfo';
import shortid from 'shortid';
import socketManager from './socketManager';

const user1 = new UserInfo("user A", "4e2d4e41-4231-40e7-b968-206532253a06", "7c237aa3-6909-4c10-9d75-95c169090c0c");
const user2 = new UserInfo("user B", "5e2d4e41-4231-40e7-b968-206532253a06", "8c237aa3-6909-4c10-9d75-95c169090c0c");
const user3 = new UserInfo("user C", "6e2d4e41-4231-40e7-b968-206532253a06", "9c237aa3-6909-4c10-9d75-95c169090c0c");

class TestIdGenerator {
    private currentIndex = 0;
    private ids = ["aaaaaa", "bbbbbb", "cccccc"];

    generate() {
        if (this.currentIndex < this.ids.length) {
            return this.ids[this.currentIndex++];
        }
        return shortid.generate();
    }
}

export default function () {
    roomManager._roomIdGenerator = new TestIdGenerator();

    const room1 = roomManager.createRoom(user1, "user1's room");
    const room2 = roomManager.createRoom(user2, "user2's room");
    const room3 = roomManager.createRoom(user3, "user3's room");
    roomManager.joinRoom(room1, user1, false);
    roomManager.joinRoom(room1, user2, false);
    roomManager.joinRoom(room1, user3, false);
}
