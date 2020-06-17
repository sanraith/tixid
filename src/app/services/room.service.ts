import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import url from 'url';
import { CreateRoomResponse, GetRoomListResponse } from 'src/shared/responses';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomUrl = 'api/rooms/';

  constructor(private http: HttpClient) {
  }

  createRoom(): Observable<CreateRoomResponse> {
    const targetUrl = url.resolve(this.roomUrl, 'create');
    return this.http.post<CreateRoomResponse>(targetUrl, null);
  }

  getRooms(): Observable<GetRoomListResponse> {
    const targetUrl = this.roomUrl;
    return this.http.get<GetRoomListResponse>(targetUrl);
  }
}
