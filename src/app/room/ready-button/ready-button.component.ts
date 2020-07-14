import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ClientActions, EmitResponse } from 'src/shared/socket';

@Component({
  selector: 'app-ready-button',
  template: `
    <button [disabled]="!isEnabled" (click)="indicateReady()">
      Ready
    </button>
  `,
  styleUrls: ['./ready-button.component.sass']
})
export class ReadyButtonComponent implements OnInit {
  @Input()
  isEnabled: boolean = true;

  constructor(private roomSocket: Socket) { }

  ngOnInit(): void {
  }

  indicateReady() {
    this.isEnabled = false;
    this.roomSocket.emit(ClientActions.indicateReady, (resp: EmitResponse) => {
      if (!resp.success) {
      } else {
        alert(resp.message);
        this.isEnabled = true;
      }
    });
  }
}
