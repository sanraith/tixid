import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import CreateRoomResponse from 'src/shared/responses/createRoomResponse';
import { HttpClient } from '@angular/common/http';
import url from 'url';

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
}
