import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { RoomListComponent } from './room-list/room-list.component';
import { LobbyComponent } from './room/lobby/lobby.component';
import { RoomContentDirective } from './room/roomContentDirective';
import { CardsDisplayComponent } from './room/cards-display/cards-display.component';
import { MakeStoryComponent } from './room/make-story/make-story.component';

const config: SocketIoConfig = { url: '', options: { autoConnect: false } };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    RoomListComponent,
    LobbyComponent,
    RoomContentDirective,
    CardsDisplayComponent,
    MakeStoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  entryComponents: [LobbyComponent],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
