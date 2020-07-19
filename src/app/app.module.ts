import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { QRCodeModule } from 'angularx-qrcode';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { RoomListComponent } from './room-list/room-list.component';
import { LobbyComponent } from './room/lobby/lobby.component';
import { RoomContentDirective } from './room/roomContentDirective';
import { MakeStoryComponent } from './room/make-story/make-story.component';
import { ExtendStoryComponent } from './room/extend-story/extend-story.component';
import { CardPickerComponent } from './room/card-picker/card-picker.component';
import { VoteStoryComponent } from './room/vote-story/vote-story.component';
import { VoteStoryResultsComponent } from './room/vote-story-results/vote-story-results.component';
import { PartialResultsComponent } from './room/partial-results/partial-results.component';
import { FinalResultsComponent } from './room/final-results/final-results.component';
import { ReadyButtonComponent } from './room/ready-button/ready-button.component';
import { CardFacedownPipe } from './pipes/card-facedown.pipe';
import { EmptyCardToCardbackPipe } from './pipes/empty-card-to-cardback.pipe';
import { PreJoinComponent } from './room/pre-join/pre-join.component';

const config: SocketIoConfig = { url: '', options: { autoConnect: false } };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    RoomListComponent,
    LobbyComponent,
    RoomContentDirective,
    MakeStoryComponent,
    ExtendStoryComponent,
    CardPickerComponent,
    VoteStoryComponent,
    VoteStoryResultsComponent,
    PartialResultsComponent,
    FinalResultsComponent,
    ReadyButtonComponent,
    CardFacedownPipe,
    EmptyCardToCardbackPipe,
    PreJoinComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    QRCodeModule
  ],
  entryComponents: [LobbyComponent],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
