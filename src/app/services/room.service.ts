import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import url from 'url';
import { CreateRoomResponse, GetRoomListResponse, CreateRoomRequest } from 'src/shared/responses';
import { GET_ROOMS_PATH } from 'src/shared/apiPaths';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private http: HttpClient) {
  }

  createRoom(roomName: string): Observable<CreateRoomResponse> {
    const targetUrl = url.resolve(GET_ROOMS_PATH, 'create');
    return this.http.post<CreateRoomResponse>(targetUrl, <CreateRoomRequest>{ name: roomName });
  }

  getRooms(): Observable<GetRoomListResponse> {
    const targetUrl = GET_ROOMS_PATH;
    return this.http.get<GetRoomListResponse>(targetUrl);
  }
}
