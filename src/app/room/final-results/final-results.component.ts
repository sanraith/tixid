import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { PublicUserInfo } from 'src/shared/model/publicUserInfo';

@Component({
    selector: 'app-final-results',
    templateUrl: './final-results.component.html',
    styleUrls: ['./final-results.component.sass']
})
export class FinalResultsComponent implements RoomContentComponent, OnInit {
    @Input()
    room: RoomModel;

    get results(): {
        place: number,
        userInfo: PublicUserInfo,
        points: number
    }[] {
        const orderedResults = this.room.localState.orderedPlayerResults.map((x, index) => ({
            place: index + 1,
            userInfo: x.userInfo,
            points: x.totalPoints
        }));

        orderedResults.forEach((x, i) => {
            if (i > 0 && x.points === orderedResults[i - 1].points) {
                x.place = orderedResults[i - 1].place;
            }
        });

        return orderedResults;
    }

    constructor() { }

    ngOnInit(): void {
    }
}
