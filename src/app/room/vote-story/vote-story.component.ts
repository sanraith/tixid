import { Component, OnInit, Input } from '@angular/core';
import RoomContentComponent from '../roomContentComponent';
import RoomModel from 'src/app/models/roomModel';
import { Socket } from 'ngx-socket-io';
import { ClientActions, VoteStoryData, EmitResponse } from 'src/shared/socket';

@Component({
    selector: 'app-vote-story',
    templateUrl: './vote-story.component.html',
    styleUrls: ['./vote-story.component.sass']
})
export class VoteStoryComponent implements RoomContentComponent, OnInit {
    @Input()
    room: RoomModel;
    voteCards: string[] = [];
    alreadyVoted: boolean = false;

    constructor(private socket: Socket) { }

    ngOnInit(): void {
    }

    voteForCard(): void {
        this.alreadyVoted = true;
        this.socket.emit(ClientActions.voteStory, <VoteStoryData>{ cardIds: this.voteCards }, (resp: EmitResponse) => {
            if (!resp.success) {
                alert(`Error: ${resp.message}`);
            }
        });
    }
}
